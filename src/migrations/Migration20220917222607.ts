import { Migration } from '@mikro-orm/migrations';

export class Migration20220917222607 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "planet" alter column "position_x" type bigint using ("position_x"::bigint);');
    this.addSql('alter table "planet" alter column "position_y" type bigint using ("position_y"::bigint);');
    this.addSql('alter table "planet" alter column "position_z" type bigint using ("position_z"::bigint);');

    this.addSql('alter table "user" alter column "position_x" type bigint using ("position_x"::bigint);');
    this.addSql('alter table "user" alter column "position_y" type bigint using ("position_y"::bigint);');
    this.addSql('alter table "user" alter column "position_z" type bigint using ("position_z"::bigint);');
  }

  async down(): Promise<void> {
    this.addSql('alter table "planet" alter column "position_x" type int using ("position_x"::int);');
    this.addSql('alter table "planet" alter column "position_y" type int using ("position_y"::int);');
    this.addSql('alter table "planet" alter column "position_z" type int using ("position_z"::int);');

    this.addSql('alter table "user" alter column "position_x" type int using ("position_x"::int);');
    this.addSql('alter table "user" alter column "position_y" type int using ("position_y"::int);');
    this.addSql('alter table "user" alter column "position_z" type int using ("position_z"::int);');
  }

}
