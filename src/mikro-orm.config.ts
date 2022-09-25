import { isProd } from './constants';
import { User } from './entities/User';
import path from 'path';
import { MikroORM } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Planet } from './entities/Planet';
import { Username } from './entities/Username';
import { Item } from './entities/Item';

const config: Parameters<typeof MikroORM.init>[0] = {
  dbName: 'space',
  type: 'postgresql' as const,
  debug: !isProd,
  entities: [User, Planet, Username, Item],
  metadataProvider: TsMorphMetadataProvider,
  migrations: {
    path: path.join(__dirname, './migrations'),
  },
};

export default config;
