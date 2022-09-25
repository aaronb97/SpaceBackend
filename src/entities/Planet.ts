import {
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { Base } from './Base';
import { Item } from './Item';
import { User } from './User';

export type PlanetType = 'planet' | 'moon' | 'star';

@Entity()
export class Planet extends Base {
  constructor(name: string, radius: number, type: PlanetType) {
    super();

    this.name = name;
    this.radius = radius;
    this.type = type;
  }

  @ManyToMany(() => User, (user) => user.visitedPlanets)
  visitedBy = new Collection<User>(this);

  @OneToMany(() => Item, (item) => item.planet)
  items = new Collection<Item>(this);

  @Property({ unique: true })
  name!: string;

  @Property()
  radius!: number;

  @Property()
  type!: PlanetType;

  @Property({ type: 'float8' })
  positionX = 0;

  @Property({ type: 'float8' })
  positionY = 0;

  @Property({ type: 'float8' })
  positionZ = 0;
}
