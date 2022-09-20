import { Migration } from '@mikro-orm/migrations';

export class Migration20220920010620 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add constraint "user_uid_unique" unique ("uid");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop constraint "user_uid_unique";');
  }

}
