import { Migration } from '@mikro-orm/migrations';

export class Migration20221006135209 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "xp" int not null default 0;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop column "xp";');
  }

}
