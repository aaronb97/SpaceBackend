import { Migration } from '@mikro-orm/migrations';

export class Migration20220923154809 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "planet" alter column "updated_at" type timestamptz(3) using ("updated_at"::timestamptz(3));');

    this.addSql('alter table "user" alter column "updated_at" type timestamptz(3) using ("updated_at"::timestamptz(3));');
  }

  async down(): Promise<void> {
    this.addSql('alter table "planet" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');

    this.addSql('alter table "user" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
  }

}
