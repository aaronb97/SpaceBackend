import { Migration } from '@mikro-orm/migrations';

export class Migration20220918135237 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" alter column "status" type smallint using ("status"::smallint);');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop constraint if exists "user_status_check";');

    this.addSql('alter table "user" alter column "status" type varchar(255) using ("status"::varchar(255));');
  }

}
