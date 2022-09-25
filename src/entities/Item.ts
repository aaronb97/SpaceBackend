import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { Base } from './Base';
import { Planet } from './Planet';
import { User } from './User';

@Entity()
export class Item extends Base {
  constructor(name: string, rarity: string, planet: Planet) {
    super();
    this.name = name;
    this.rarity = rarity;
    this.planet = planet;
  }

  @Property()
  name!: string;

  @Property()
  rarity!: string;

  @ManyToOne()
  planet!: Planet;

  @ManyToMany(() => User, (user) => user.items)
  collectedBy = new Collection<User>(this);
}
