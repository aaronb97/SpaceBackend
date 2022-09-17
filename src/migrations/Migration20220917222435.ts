import { Migration } from '@mikro-orm/migrations';

export class Migration20220917222435 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "planet" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "name" varchar(255) not null, "radius" int not null, "type" varchar(255) not null, "position_x" int not null, "position_y" int not null, "position_z" int not null);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "planet" cascade;');
  }

}
