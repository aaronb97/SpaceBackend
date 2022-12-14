import {
  Collection,
  Entity,
  Enum,
  ManyToMany,
  ManyToOne,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Base } from './Base';
import { Planet } from './Planet';
import { v4 } from 'uuid';
import { Item } from './Item';
import { calculateDist } from '../calculateDist';
import { UserGroup } from './UserGroup';
import { generateColor } from '../generateColor';

const square = (num: number) => Math.pow(num, 2);

@Entity()
export class User extends Base {
  constructor(uid: string, username: string, planet: Planet) {
    super();

    this.uid = uid;
    this.username = username;
    this.planet = planet;
  }

  @ManyToOne()
  planet: Planet;

  @ManyToMany()
  visitedPlanets = new Collection<Planet>(this);

  @ManyToMany()
  items = new Collection<Item>(this);

  @ManyToMany(() => UserGroup, (group) => group.users)
  groups = new Collection<UserGroup>(this);

  @Property({ hidden: true, unique: true })
  uid: string;

  @Unique()
  @Property({ onCreate: () => v4() })
  uuid!: string;

  @Unique()
  @Property()
  username: string;

  @Property({ default: '' })
  color: string = generateColor();

  @Property({ default: 0 })
  xp = 0;

  /**
   * Speed in km / hour
   */
  @Property({ default: 30000, type: 'float8' })
  baseSpeed = 30000;

  @Property({ default: 0, type: 'float8' })
  speed = 0;

  @Property({ type: 'float8' })
  positionX = 0;

  @Property({ type: 'float8' })
  positionY = 0;

  @Property({ type: 'float8' })
  positionZ = 0;

  @Property({ type: 'float8', default: 0 })
  velocityX = 0;

  @Property({ type: 'float8', default: 0 })
  velocityY = 0;

  @Property({ type: 'float8', default: 0 })
  velocityZ = 0;

  @Property({ nullable: true, length: 3 })
  nextBoost?: Date;

  @Property({ nullable: true, length: 3 })
  landingTime?: Date;

  @Property({ persist: false })
  notification?: string;

  @Property({ default: false })
  godmode!: boolean;

  @Property({ persist: false })
  get serverTime() {
    return new Date();
  }

  @Property({ persist: false })
  get speedBoostAvailable() {
    return this.isNextBoostTimeLessThanCurrentTime();
  }

  @Property({ persist: false })
  public get level() {
    let level = 1;

    while (Math.pow(level, 1.5) < this.xp) {
      level++;
    }

    return level;
  }

  @Enum(() => UserStatus)
  status: UserStatus = UserStatus.LANDED;

  /**
   * Update positions according the elapsed time since last update
   */
  public updatePositions() {
    if (this.isLandingTimeLessThanCurrentTime()) {
      this.landOnPlanet(this.planet);
      return;
    }

    const time = new Date();

    const last = this.updatedAt;

    const elapsed = time.getTime() - last.getTime();
    if (elapsed < 0) {
      throw new Error(`elapsed should not be less than 0: ${elapsed}`);
    }

    const km = elapsed / 1000 / 60 / 60;

    this.positionX += this.velocityX * km;
    this.positionY += this.velocityY * km;
    this.positionZ += this.velocityZ * km;
  }

  public isNextBoostTimeLessThanCurrentTime() {
    if (!this.nextBoost) {
      return false;
    }

    return new Date().getTime() > this.nextBoost.getTime();
  }

  public isLandingTimeLessThanCurrentTime() {
    if (!this.landingTime) {
      return false;
    }

    return new Date().getTime() > this.landingTime.getTime();
  }

  public landOnPlanet(planet: Planet, collectItem = true) {
    this.planet = planet;
    this.nextBoost = undefined;
    this.landingTime = undefined;
    this.status = UserStatus.LANDED;
    this.positionX = this.planet.positionX;
    this.positionY = this.planet.positionY;
    this.positionZ = this.planet.positionZ;
    this.speed = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.velocityZ = 0;

    console.log(`User ${this.uid} landed on planet ${planet.name}`);

    if (!this.visitedPlanets.contains(planet) && collectItem) {
      const oldLevel = this.level;

      const random = Math.random();

      let rarity: string;
      if (random <= 0.05) {
        rarity = 'legendary';
        this.xp += 3;
      } else if (random <= 0.2) {
        rarity = 'rare';
        this.xp += 1;
      } else {
        rarity = 'common';
      }

      const item = planet.items.getItems().find((x) => x.rarity === rarity);
      if (!item) {
        throw new Error('Item not found');
      }

      const baseSpeedIncrease = this.getBaseSpeedIncrease(planet);

      if (planet.name !== 'Earth') {
        this.notification = `Welcome to ${
          planet.name
        }! Your base speed has increased by ${baseSpeedIncrease.toLocaleString()}, and you have collected "${
          item.name
        }"`;

        this.xp += this.getXPIncrease(planet);

        const newLevel = this.level;

        if (newLevel > oldLevel) {
          this.notification += ` You have leveled up from Level ${oldLevel} to Level ${newLevel}!`;
        }
      }

      this.items.add(item);
      this.baseSpeed += baseSpeedIncrease;

      this.visitedPlanets.add(this.planet);
    }
  }

  public getBaseSpeedIncrease(planet: Planet) {
    switch (planet.type) {
      case 'planet':
        return 10000;
      case 'moon':
        return 5000;
      case 'star':
        return 30000;
      case 'dwarf':
        return 7500;
    }
  }

  public getXPIncrease(planet: Planet) {
    if (planet.name === 'Earth') {
      return 0;
    }

    if (planet.name === 'The Sun') {
      return 15;
    }

    switch (planet.type) {
      case 'planet':
        return 10;
      case 'moon':
        return 3;
      case 'star':
        return 30;
      case 'dwarf':
        return 5;
    }
  }

  public setLandingTime() {
    const distance = calculateDist(this, this.planet) - this.planet.radius;

    const time = (distance / this.speed) * 60 * 60 * 1000;

    this.landingTime = new Date(
      new Date().getTime() + Math.min(time, 3.154e13),
    );
  }

  public startTraveling(planet: Planet) {
    const vector = [
      planet.positionX - this.positionX,
      planet.positionY - this.positionY,
      planet.positionZ - this.positionZ,
    ] as const;

    const magnitude = Math.sqrt(
      square(vector[0]) + square(vector[1]) + square(vector[2]),
    );

    const unitVector = [
      vector[0] / magnitude,
      vector[1] / magnitude,
      vector[2] / magnitude,
    ] as const;

    this.velocityX = unitVector[0] * this.baseSpeed;
    this.velocityY = unitVector[1] * this.baseSpeed;
    this.velocityZ = unitVector[2] * this.baseSpeed;

    if (this.status === UserStatus.LANDED) {
      const radius = this.planet.radius;
      this.positionX += unitVector[0] * radius;
      this.positionY += unitVector[1] * radius;
      this.positionZ += unitVector[2] * radius;
    }

    this.planet = planet;
    this.speed = this.baseSpeed;

    this.status = UserStatus.TRAVELING;

    this.setLandingTime();
  }

  public speedBoost(speedBoostFactor = 2) {
    const speed1 = this.speed;
    this.speed *= speedBoostFactor;
    this.velocityX *= speedBoostFactor;
    this.velocityY *= speedBoostFactor;
    this.velocityZ *= speedBoostFactor;

    const oldLevel = this.level;
    this.xp += 1;
    const newLevel = this.level;

    this.notification = `Your speed has been boosted from ${speed1.toLocaleString()} to ${this.speed.toLocaleString()}!`;
    if (newLevel > oldLevel) {
      this.notification += ` You have leveled up from Level ${oldLevel} to Level ${newLevel}!`;
    }
  }

  public updateNextBoost() {
    const time = new Date();
    this.nextBoost = new Date(time.getTime() + 8 * 60 * 60 * 1000);
  }
}

export enum UserStatus {
  TRAVELING,
  LANDED,
}
