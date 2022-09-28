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

  @Property({ hidden: true, unique: true })
  uid: string;

  @Unique()
  @Property({ onCreate: () => v4() })
  uuid!: string;

  @Unique()
  @Property()
  username: string;

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

  @Property({ persist: false })
  get serverTime() {
    return new Date();
  }

  @Property({ persist: false })
  get speedBoostAvailable() {
    return this.isNextBoostTimeLessThanCurrentTime();
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
      console.log(time, last);
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

  public landOnPlanet(planet: Planet) {
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

    if (!this.visitedPlanets.contains(planet)) {
      const random = Math.random();

      let rarity: string;
      if (random <= 0.01) {
        rarity = 'legendary';
      } else if (random <= 0.1) {
        rarity = 'rare';
      } else {
        rarity = 'common';
      }

      const item = planet.items.getItems().find((x) => x.rarity === rarity);
      if (!item) {
        throw new Error('Item not found');
      }

      if (planet.name !== 'Earth') {
        this.notification = `Welcome to ${planet.name}! Your base speed has increased by 10,000, and you have collected "${item.name}"`;
      }

      this.items.add(item);
      this.baseSpeed += 10000;
    }

    this.visitedPlanets.add(this.planet);
  }

  public setLandingTime() {
    const [x1, y1, z1] = [this.positionX, this.positionY, this.positionZ];
    const [x2, y2, z2] = [
      this.planet.positionX,
      this.planet.positionY,
      this.planet.positionZ,
    ];

    const distance = Math.sqrt(
      square(x2 - x1) + (square(y2 - y1) + square(z2 - z1)),
    );

    const time = (distance / this.speed) * 60 * 60 * 1000;

    this.landingTime = new Date(
      new Date().getTime() + Math.min(time, 3.154e13),
    );
  }

  public startTraveling(planet: Planet) {
    this.planet = planet;
    this.speed = this.baseSpeed;
    this.status = UserStatus.TRAVELING;

    this.setLandingTime();

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
  }

  public speedBoost(speedBoostFactor = 2) {
    this.speed *= speedBoostFactor;
    this.velocityX *= speedBoostFactor;
    this.velocityY *= speedBoostFactor;
    this.velocityZ *= speedBoostFactor;
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
