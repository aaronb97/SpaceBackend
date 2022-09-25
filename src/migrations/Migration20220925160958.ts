import { Migration } from '@mikro-orm/migrations';

export class Migration20220925160958 extends Migration {

  async up(): Promise<void> {
    this.addSql('drop table if exists "username" cascade;');

    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
  }

  async down(): Promise<void> {
    this.addSql('create table "username" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(3) not null, "name" varchar(255) not null, "count" int not null default 1);');
    this.addSql('alter table "username" add constraint "username_name_unique" unique ("name");');

    this.addSql('alter table "user" drop constraint "user_username_unique";');
  }

}
