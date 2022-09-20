import { Migration } from '@mikro-orm/migrations';

export class Migration20220920122052 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "landing_time" timestamptz(0) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop column "landing_time";');
  }

}
