import { Entity, ManyToOne, Property, Unique } from "@mikro-orm/core";
import { Base } from "./Base";
import { Planet } from "./Planet";

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

  @Property({ hidden: true })
  uid: string;

  @Unique()
  @Property()
  username: string;

  @Property({ type: "bigint" })
  positionX = 0;

  @Property({ type: "bigint" })
  positionY = 0;

  @Property({ type: "bigint" })
  positionZ = 0;

  @Property()
  velocityX = 0;

  @Property()
  velocityY = 0;

  @Property()
  velocityZ = 0;
}
