import { Entity, Property } from "@mikro-orm/core";
import { Base } from "./Base";

@Entity()
export class User extends Base {
  @Property()
  uid!: string;

  @Property()
  username!: string;

  @Property()
  positionX = 0;

  @Property()
  positionY = 0;

  @Property()
  positionZ = 0;

  @Property()
  velocityX = 0;

  @Property()
  velocityY = 0;

  @Property()
  velocityZ = 0;
}
