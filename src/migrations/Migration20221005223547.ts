import { Migration } from '@mikro-orm/migrations';

export class Migration20221005223547 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "color" varchar(255) not null default \'\';');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop column "color";');
  }

}
