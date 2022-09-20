import { Migration } from '@mikro-orm/migrations';

export class Migration20220920003504 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "base_speed" double precision not null default 50000;');
    this.addSql('alter table "user" alter column "position_x" type double precision using ("position_x"::double precision);');
    this.addSql('alter table "user" alter column "position_y" type double precision using ("position_y"::double precision);');
    this.addSql('alter table "user" alter column "position_z" type double precision using ("position_z"::double precision);');
    this.addSql('alter table "user" alter column "velocity_x" type double precision using ("velocity_x"::double precision);');
    this.addSql('alter table "user" alter column "velocity_x" set default 0;');
    this.addSql('alter table "user" alter column "velocity_y" type double precision using ("velocity_y"::double precision);');
    this.addSql('alter table "user" alter column "velocity_y" set default 0;');
    this.addSql('alter table "user" alter column "velocity_z" type double precision using ("velocity_z"::double precision);');
    this.addSql('alter table "user" alter column "velocity_z" set default 0;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" alter column "position_x" type bigint using ("position_x"::bigint);');
    this.addSql('alter table "user" alter column "position_y" type bigint using ("position_y"::bigint);');
    this.addSql('alter table "user" alter column "position_z" type bigint using ("position_z"::bigint);');
    this.addSql('alter table "user" alter column "velocity_x" drop default;');
    this.addSql('alter table "user" alter column "velocity_x" type int using ("velocity_x"::int);');
    this.addSql('alter table "user" alter column "velocity_y" drop default;');
    this.addSql('alter table "user" alter column "velocity_y" type int using ("velocity_y"::int);');
    this.addSql('alter table "user" alter column "velocity_z" drop default;');
    this.addSql('alter table "user" alter column "velocity_z" type int using ("velocity_z"::int);');
    this.addSql('alter table "user" drop column "base_speed";');
  }

}
