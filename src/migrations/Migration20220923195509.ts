import { Migration } from '@mikro-orm/migrations';

export class Migration20220923195509 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "uuid" varchar(255) not null;');
    this.addSql('alter table "user" drop constraint "user_username_unique";');
    this.addSql('alter table "user" add constraint "user_uuid_unique" unique ("uuid");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop constraint "user_uuid_unique";');
    this.addSql('alter table "user" drop column "uuid";');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
  }

}
