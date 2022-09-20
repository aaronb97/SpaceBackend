import { Entity, Enum, ManyToOne, Property, Unique } from "@mikro-orm/core";
import { Base } from "./Base";
import { Planet } from "./Planet";

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

  @Property({ hidden: true, unique: true })
  uid: string;

  @Unique()
  @Property()
  username: string;

  /**
   * Speed in km / hour
   */
  @Property({ default: 50000, type: "float8" })
  baseSpeed = 50000;

  @Property({ default: 50000, type: "float8" })
  speed = 50000;

  @Property({ type: "float8" })
  positionX = 0;

  @Property({ type: "float8" })
  positionY = 0;

  @Property({ type: "float8" })
  positionZ = 0;

  @Property({ type: "float8", default: 0 })
  velocityX = 0;

  @Property({ type: "float8", default: 0 })
  velocityY = 0;

  @Property({ type: "float8", default: 0 })
  velocityZ = 0;

  @Property({ nullable: true })
  nextBoost?: Date;

  @Property({ nullable: true })
  landingTime?: Date;

  @Property({ persist: false })
  get serverTime() {
    return new Date();
  }

  @Enum(() => UserStatus)
  status: UserStatus = UserStatus.LANDED;

  /**
   * Update positions according the elapsed time since last update
   */
  public updatePositions() {
    const time = new Date();

    if (this.status === UserStatus.TRAVELING && time > this.landingTime!) {
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
      return;
    }

    const last = this.updatedAt;

    const elapsed = time.getTime() - last.getTime();

    const km = elapsed / 1000 / 60 / 60;

    console.log("Elapsed time", elapsed);

    this.positionX += this.velocityX * km;
    this.positionY += this.velocityY * km;
    this.positionZ += this.velocityZ * km;
  }

  public setLandingTime() {
    const [x1, y1, z1] = [this.positionX, this.positionY, this.positionZ];
    const [x2, y2, z2] = [
      this.planet.positionX,
      this.planet.positionY,
      this.planet.positionZ,
    ];

    const distance = Math.sqrt(
      square(x2 - x1) + (square(y2 - y1) + square(z2 - z1))
    );

    const time = (distance / this.speed) * 60 * 60 * 1000;

    this.landingTime = new Date(new Date().getTime() + time);
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
      square(vector[0]) + square(vector[1]) + square(vector[2])
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
