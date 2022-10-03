import {
  Unique,
  Property,
  ManyToMany,
  Collection,
  Entity,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Base } from './Base';
import { User } from './User';

@Entity()
export class UserGroup extends Base {
  @Unique()
  @Property({ onCreate: () => v4() })
  uuid!: string;

  @Unique()
  @Property()
  name!: string;

  @ManyToMany()
  users = new Collection<User>(this);
}
