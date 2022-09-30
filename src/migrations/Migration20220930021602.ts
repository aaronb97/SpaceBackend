import { Migration } from '@mikro-orm/migrations';

export class Migration20220930021602 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "planet" add column "orbiting_id" int null;');
    this.addSql('alter table "planet" add constraint "planet_orbiting_id_foreign" foreign key ("orbiting_id") references "planet" ("id") on update cascade on delete set null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "planet" drop constraint "planet_orbiting_id_foreign";');

    this.addSql('alter table "planet" drop column "orbiting_id";');
  }

}
