import { Migration } from '@mikro-orm/migrations';

export class Migration20220927132001 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" alter column "base_speed" type double precision using ("base_speed"::double precision);');
    this.addSql('alter table "user" alter column "base_speed" set default 30000;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" alter column "base_speed" type double precision using ("base_speed"::double precision);');
    this.addSql('alter table "user" alter column "base_speed" set default 40000;');
  }

}
