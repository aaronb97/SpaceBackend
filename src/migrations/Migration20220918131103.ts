import { Migration } from '@mikro-orm/migrations';

export class Migration20220918131103 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "planet_id" int not null;');
    this.addSql('alter table "user" add constraint "user_planet_id_foreign" foreign key ("planet_id") references "planet" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop constraint "user_planet_id_foreign";');

    this.addSql('alter table "user" drop column "planet_id";');
  }

}
