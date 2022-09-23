import { Migration } from '@mikro-orm/migrations';

export class Migration20220923125730 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "planet" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "name" varchar(255) not null, "radius" int not null, "type" varchar(255) not null, "position_x" double precision not null, "position_y" double precision not null, "position_z" double precision not null);');
    this.addSql('alter table "planet" add constraint "planet_name_unique" unique ("name");');

    this.addSql('create table "user" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "planet_id" int not null, "uid" varchar(255) not null, "username" varchar(255) not null, "base_speed" double precision not null default 50000, "speed" double precision not null default 50000, "position_x" double precision not null, "position_y" double precision not null, "position_z" double precision not null, "velocity_x" double precision not null default 0, "velocity_y" double precision not null default 0, "velocity_z" double precision not null default 0, "next_boost" timestamptz(0) null, "landing_time" timestamptz(0) null, "status" smallint not null);');
    this.addSql('alter table "user" add constraint "user_uid_unique" unique ("uid");');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');

    this.addSql('alter table "user" add constraint "user_planet_id_foreign" foreign key ("planet_id") references "planet" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop constraint "user_planet_id_foreign";');

    this.addSql('drop table if exists "planet" cascade;');

    this.addSql('drop table if exists "user" cascade;');
  }

}
