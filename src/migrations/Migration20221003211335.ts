import { Migration } from '@mikro-orm/migrations';

export class Migration20221003211335 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user_group" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(3) not null, "uuid" varchar(255) not null);');
    this.addSql('alter table "user_group" add constraint "user_group_uuid_unique" unique ("uuid");');

    this.addSql('create table "user_group_users" ("user_group_id" int not null, "user_id" int not null, constraint "user_group_users_pkey" primary key ("user_group_id", "user_id"));');

    this.addSql('alter table "user_group_users" add constraint "user_group_users_user_group_id_foreign" foreign key ("user_group_id") references "user_group" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "user_group_users" add constraint "user_group_users_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user_group_users" drop constraint "user_group_users_user_group_id_foreign";');

    this.addSql('drop table if exists "user_group" cascade;');

    this.addSql('drop table if exists "user_group_users" cascade;');
  }

}
