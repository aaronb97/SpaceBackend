import { Migration } from '@mikro-orm/migrations';

export class Migration20220920120831 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "speed" double precision not null default 50000;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop column "speed";');
  }

}
