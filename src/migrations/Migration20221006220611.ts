import { Migration } from '@mikro-orm/migrations';

export class Migration20221006220611 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "godmode" boolean not null default false;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop column "godmode";');
  }

}
