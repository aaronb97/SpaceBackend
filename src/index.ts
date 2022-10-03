import { MikroORM } from '@mikro-orm/core';
import { defineRoutes } from './defineRoutes';
import { app } from './express';
import mikroOrmConfig from './mikro-orm.config';

import * as dotenv from 'dotenv';
import { setupPlanets } from './setupPlanets';
import { planets } from './planets';

dotenv.config();

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);

  await orm.getMigrator().up();

  await setupPlanets(orm.em.fork(), planets);

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
