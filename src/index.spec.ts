import axios, { Axios } from 'axios';
import express from 'express';
import { defineRoutes } from './defineRoutes';
import * as http from 'http';
import { Express } from 'express-serve-static-core';
import { MikroORM, IDatabaseDriver, Connection } from '@mikro-orm/core';
import mikroOrmConfig from './mikro-orm.config';

let connection: http.Server;
let expressApp: Express;
let axiosClient: Axios;
let orm: MikroORM<IDatabaseDriver<Connection>>;

const initializeWebServer = async () => {
  expressApp = express();
  orm = await MikroORM.init(mikroOrmConfig);
  await defineRoutes(expressApp, orm);
  connection = expressApp.listen();
};

const stopWebServer = async () => {
  return await new Promise((resolve) => {
    connection.close(() => {
      resolve(null);
    });
  });
};

beforeAll(async () => {
  await initializeWebServer();

  const address = connection.address();
  let port = '';

  if (typeof address === 'string') {
    port = address;
  } else if (address !== null) {
    port = String(address.port);
  }

  axiosClient = axios.create({
    baseURL: `http://127.0.0.1:${port}`,
  });
});

afterAll(async () => {
  await orm.close();
  await stopWebServer();
});

describe('/planets', () => {
  test('it should fetch the planets', async () => {
    const result = await axiosClient.get('/planets');
    const data = result.data;

    expect(data.some((planet: { name: string }) => planet.name === 'Earth'));
    expect(data.some((planet: { name: string }) => planet.name === 'The Sun'));
  });
});
