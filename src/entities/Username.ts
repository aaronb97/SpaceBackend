import { Entity, Property, Unique } from '@mikro-orm/core';
import { Base } from './Base';

@Entity()
export class Username extends Base {
  constructor(name: string) {
    super();
    this.name = name;
  }

  @Unique()
  @Property()
  name!: string;

  @Property({ default: 1 })
  count: number = 1;
}
