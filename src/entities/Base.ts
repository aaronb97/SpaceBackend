import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

export class Base {
  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}
