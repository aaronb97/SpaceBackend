import { Migration } from '@mikro-orm/migrations';

export class Migration20220920131046 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "planet" alter column "position_x" type double precision using ("position_x"::double precision);');
    this.addSql('alter table "planet" alter column "position_y" type double precision using ("position_y"::double precision);');
    this.addSql('alter table "planet" alter column "position_z" type double precision using ("position_z"::double precision);');
  }

  async down(): Promise<void> {
    this.addSql('alter table "planet" alter column "position_x" type bigint using ("position_x"::bigint);');
    this.addSql('alter table "planet" alter column "position_y" type bigint using ("position_y"::bigint);');
    this.addSql('alter table "planet" alter column "position_z" type bigint using ("position_z"::bigint);');
  }

}
