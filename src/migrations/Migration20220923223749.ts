import { Migration } from '@mikro-orm/migrations';

export class Migration20220923223749 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user_visited_planets" ("user_id" int not null, "planet_id" int not null, constraint "user_visited_planets_pkey" primary key ("user_id", "planet_id"));');

    this.addSql('alter table "user_visited_planets" add constraint "user_visited_planets_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "user_visited_planets" add constraint "user_visited_planets_planet_id_foreign" foreign key ("planet_id") references "planet" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "user_visited_planets" cascade;');
  }

}
