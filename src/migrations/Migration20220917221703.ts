import { Migration } from '@mikro-orm/migrations';

export class Migration20220917221703 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "uid" varchar(255) not null, add column "username" varchar(255) not null, add column "position_x" int not null, add column "position_y" int not null, add column "position_z" int not null, add column "velocity_x" int not null, add column "velocity_y" int not null, add column "velocity_z" int not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop column "uid";');
    this.addSql('alter table "user" drop column "username";');
    this.addSql('alter table "user" drop column "position_x";');
    this.addSql('alter table "user" drop column "position_y";');
    this.addSql('alter table "user" drop column "position_z";');
    this.addSql('alter table "user" drop column "velocity_x";');
    this.addSql('alter table "user" drop column "velocity_y";');
    this.addSql('alter table "user" drop column "velocity_z";');
  }

}
