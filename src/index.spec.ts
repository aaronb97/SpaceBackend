/* eslint-disable @typescript-eslint/restrict-template-expressions */
import axios, { Axios } from 'axios';
import express from 'express';
import { defineRoutes } from './defineRoutes';
import * as http from 'http';
import { Express } from 'express-serve-static-core';
import { MikroORM, IDatabaseDriver, Connection } from '@mikro-orm/core';
import mikroOrmConfig from './mikro-orm.config';
import { validateUser } from './validateUser';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

jest.mock('./validateUser');

jest.mocked(validateUser).mockImplementation(
  async (jwt: string | undefined) =>
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    await Promise.resolve({ uid: jwt } as DecodedIdToken),
);

let connection: http.Server;
let expressApp: Express;
let axiosClient: Axios;
let orm: MikroORM<IDatabaseDriver<Connection>>;

const initializeWebServer = async () => {
  expressApp = express();
  orm = await MikroORM.init({ ...mikroOrmConfig, dbName: 'spaceTest' });
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
    validateStatus: () => true,
  });

  await orm.getMigrator().up();
  await defineRoutes(expressApp, orm);
});

afterAll(async () => {
  const generator = orm.getSchemaGenerator();
  await generator.dropDatabase('spaceTest');
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

describe('/login', () => {
  test('it should create a new user when logging in with a new user', async () => {
    const result = await axiosClient.post('/login', undefined, {
      headers: {
        authorization: 'user1',
      },
    });

    expect(result.data.planet.name).toBe('Earth');
    expect(result.status).toBe(201);

    const result2 = await axiosClient.post('/login', undefined, {
      headers: {
        authorization: 'user1',
      },
    });

    expect(result2.status).toBe(200);
  });
});

describe('/travelingTo and positions', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2020, 1, 1));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('it should update users positions after traveling somewhere and time has passed', async () => {
    const result = await axiosClient.post('/login', undefined, {
      headers: {
        authorization: 'user1',
      },
    });

    await axiosClient.post('/travelingTo/2', undefined, {
      headers: {
        authorization: 'user1',
      },
    });

    jest.advanceTimersByTime(1000);

    const result2 = await axiosClient.post('/login', undefined, {
      headers: {
        authorization: 'user1',
      },
    });

    expect(result.data.positionX).not.toBe(result2.data.positionX);
    expect(result.data.positionY).not.toBe(result2.data.positionY);
    expect(result.data.positionZ).not.toBe(result2.data.positionZ);
  });

  test('it should return an error if the traveling id is invalid', async () => {
    await axiosClient.post('/login', undefined, {
      headers: {
        authorization: 'user1',
      },
    });

    const result = await axiosClient.post('/travelingTo/-1', undefined, {
      headers: {
        authorization: 'user1',
      },
    });

    expect(result.status).toBe(404);
  });

  test('it should return an error if the user is already associated with that planet', async () => {
    const user = await axiosClient.post('/login', undefined, {
      headers: {
        authorization: 'user1',
      },
    });

    const result = await axiosClient.post(
      `/travelingTo/${user.data.planet.id}`,
      undefined,
      {
        headers: {
          authorization: 'user1',
        },
      },
    );

    expect(result.status).toBe(400);
  });
});
