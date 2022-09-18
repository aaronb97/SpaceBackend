import { Migration } from '@mikro-orm/migrations';

export class Migration20220918234728 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "planet" add constraint "planet_name_unique" unique ("name");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "planet" drop constraint "planet_name_unique";');
  }

}
