import { Migration } from '@mikro-orm/migrations';

export class Migration20220927121952 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" alter column "base_speed" type double precision using ("base_speed"::double precision);');
    this.addSql('alter table "user" alter column "base_speed" set default 40000;');
    this.addSql('alter table "user" alter column "speed" type double precision using ("speed"::double precision);');
    this.addSql('alter table "user" alter column "speed" set default 0;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" alter column "base_speed" type double precision using ("base_speed"::double precision);');
    this.addSql('alter table "user" alter column "base_speed" set default 50000;');
    this.addSql('alter table "user" alter column "speed" type double precision using ("speed"::double precision);');
    this.addSql('alter table "user" alter column "speed" set default 50000;');
  }

}
