import { MikroORM } from '@mikro-orm/core';
import { defineRoutes } from './defineRoutes';
import { app } from './express';
import mikroOrmConfig from './mikro-orm.config';

import * as dotenv from 'dotenv';
dotenv.config();

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);

  await orm.getMigrator().up();

  await defineRoutes(app, orm);

  const port = process.env.PORT ?? 3000;
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });

  process.on('exit', () => {
    void orm.close();
  });
};

main().catch((e) => console.error(e));
