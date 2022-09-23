import { Migration } from '@mikro-orm/migrations';

export class Migration20220923155503 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" alter column "next_boost" type timestamptz(3) using ("next_boost"::timestamptz(3));');
    this.addSql('alter table "user" alter column "landing_time" type timestamptz(3) using ("landing_time"::timestamptz(3));');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" alter column "next_boost" type timestamptz(0) using ("next_boost"::timestamptz(0));');
    this.addSql('alter table "user" alter column "landing_time" type timestamptz(0) using ("landing_time"::timestamptz(0));');
  }

}
