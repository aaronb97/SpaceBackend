import { Entity, Property } from "@mikro-orm/core";
import { Base } from "./Base";

export type PlanetType = "planet" | "moon" | "star";

@Entity()
export class Planet extends Base {
  constructor(name: string, radius: number, type: PlanetType) {
    super();

    this.name = name;
    this.radius = radius;
    this.type = type;
  }

  @Property({ unique: true })
  name!: string;

  @Property()
  radius!: number;

  @Property()
  type!: PlanetType;

  @Property({ type: "bigint" })
  positionX = 0;

  @Property({ type: "bigint" })
  positionY = 0;

  @Property({ type: "bigint" })
  positionZ = 0;
}
