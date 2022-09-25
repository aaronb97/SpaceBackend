import { isProd } from './constants';
import path from 'path';
import { MikroORM } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

const config: Parameters<typeof MikroORM.init>[0] = {
  dbName: process.env.DATABASE_NAME ?? 'space',
  type: 'postgresql' as const,
  debug: !isProd,
  clientUrl: process.env.DATABASE_URL,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  entities: ['./dist/entities'],
  entitiesTs: ['./src/entities'],
  metadataProvider: TsMorphMetadataProvider,
  migrations: {
    path: path.join(__dirname, './migrations'),
  },
};

export default config;
