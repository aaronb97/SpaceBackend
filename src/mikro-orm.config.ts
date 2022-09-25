import { isProd } from './constants';
import path from 'path';
import { MikroORM } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

const config: Parameters<typeof MikroORM.init>[0] = {
  dbName: 'space',
  type: 'postgresql' as const,
  debug: !isProd,
  entities: ['./dist/entities'],
  entitiesTs: ['./src/entities'],
  metadataProvider: TsMorphMetadataProvider,
  migrations: {
    path: path.join(__dirname, './migrations'),
  },
};

export default config;
