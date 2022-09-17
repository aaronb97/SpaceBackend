import { isProd } from "./constants";
import { User } from "./entities/User";
import path from "path";
import { MikroORM } from "@mikro-orm/core";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { Planet } from "./entities/Planet";

export default {
  dbName: "space",
  type: "postgresql" as const,
  debug: !isProd,
  entities: [User, Planet],
  metadataProvider: TsMorphMetadataProvider,
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
} as Parameters<typeof MikroORM.init>[0];
