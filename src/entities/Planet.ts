import { Entity, Property } from "@mikro-orm/core";
import { Base } from "./Base";

@Entity()
export class Planet extends Base {
  @Property()
  name!: string;

  @Property()
  radius!: number;

  @Property()
  type!: string;

  @Property({ type: "bigint" })
  positionX = 0;

  @Property({ type: "bigint" })
  positionY = 0;

  @Property({ type: "bigint" })
  positionZ = 0;
}
