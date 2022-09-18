import { Entity, Property, Unique } from "@mikro-orm/core";
import { Base } from "./Base";

@Entity()
export class User extends Base {
  @Property()
  uid!: string;

  @Unique()
  @Property()
  username!: string;

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
