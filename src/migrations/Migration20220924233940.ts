import { Migration } from '@mikro-orm/migrations';

export class Migration20220924233940 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "item" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(3) not null, "name" varchar(255) not null, "rarity" varchar(255) not null, "planet_id" int not null);');

    this.addSql('create table "user_items" ("user_id" int not null, "item_id" int not null, constraint "user_items_pkey" primary key ("user_id", "item_id"));');

    this.addSql('alter table "item" add constraint "item_planet_id_foreign" foreign key ("planet_id") references "planet" ("id") on update cascade;');

    this.addSql('alter table "user_items" add constraint "user_items_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "user_items" add constraint "user_items_item_id_foreign" foreign key ("item_id") references "item" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user_items" drop constraint "user_items_item_id_foreign";');

    this.addSql('drop table if exists "item" cascade;');

    this.addSql('drop table if exists "user_items" cascade;');
  }

}
