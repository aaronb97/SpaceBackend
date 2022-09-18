import { Migration } from '@mikro-orm/migrations';

export class Migration20220918134911 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "next_boost" timestamptz(0) null, add column "status" varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop column "next_boost";');
    this.addSql('alter table "user" drop column "status";');
  }

}
