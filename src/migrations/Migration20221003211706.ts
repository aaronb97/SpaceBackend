import { Migration } from '@mikro-orm/migrations';

export class Migration20221003211706 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user_group" add column "name" varchar(255) not null;');
    this.addSql('alter table "user_group" add constraint "user_group_name_unique" unique ("name");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user_group" drop constraint "user_group_name_unique";');
    this.addSql('alter table "user_group" drop column "name";');
  }

}
