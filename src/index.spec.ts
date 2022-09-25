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
import { Planet } from './entities/Planet';

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

afterEach(async () => {
  await orm.em.nativeDelete('user', {});
});

afterAll(async () => {
  const generator = orm.getSchemaGenerator();
  await generator.dropDatabase('spaceTest');
  await orm.close();
  await stopWebServer();
});

describe('/planets', () => {
  it('should fetch the planets', async () => {
    const result = await axiosClient.get('/planets');
    const data = result.data;

    expect(data.some((planet: { name: string }) => planet.name === 'Earth'));
    expect(data.some((planet: { name: string }) => planet.name === 'The Sun'));
  });
});

const user1Config = {
  headers: {
    authorization: 'user1',
  },
};

describe('/login', () => {
  it('should create a new user when logging in with a new user', async () => {
    const result = await axiosClient.post('/login', undefined, user1Config);

    expect(result.data.planet.name).toBe('Earth');
    expect(result.data.visitedPlanets[0].name).toBe('Earth');
    expect(result.data.items.length).toBe(1);
    expect(result.status).toBe(201);

    const result2 = await axiosClient.post('/login', undefined, user1Config);

    expect(result2.status).toBe(200);
  });
});

describe('/travelingTo and positions', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.setSystemTime(new Date(2020, 1, 1));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should update users positions after traveling somewhere and time has passed', async () => {
    const result = await axiosClient.post('/login', undefined, user1Config);

    await axiosClient.post('/travelingTo/2', undefined, user1Config);

    jest.advanceTimersByTime(1000);

    const result2 = await axiosClient.post('/login', undefined, user1Config);

    expect(result.data.positionX).not.toBe(result2.data.positionX);
    expect(result.data.positionY).not.toBe(result2.data.positionY);
    expect(result.data.positionZ).not.toBe(result2.data.positionZ);
  });

  it('should return an error if the traveling id is invalid', async () => {
    await axiosClient.post('/login', undefined, user1Config);

    const result = await axiosClient.post(
      '/travelingTo/-1',
      undefined,
      user1Config,
    );

    expect(result.status).toBe(404);
  });

  it('should return an error if the user is already associated with that planet', async () => {
    const user = await axiosClient.post('/login', undefined, user1Config);

    const result = await axiosClient.post(
      `/travelingTo/${user.data.planet.id}`,
      undefined,
      user1Config,
    );

    expect(result.status).toBe(400);
  });

  it('should update the users position to the planet if enough time has passed, and add the planet to visitedPlanets', async () => {
    await axiosClient.post('/login', undefined, user1Config);
    await axiosClient.post('/travelingTo/2', undefined, user1Config);

    jest.advanceTimersByTime(1000000000000);

    const { data } = await axiosClient.post('/login', undefined, user1Config);
    const { visitedPlanets } = data;

    expect(data.speed).toBe(0);
    expect(data.positionX).toBe(data.planet.positionX);
    expect(data.positionY).toBe(data.planet.positionY);
    expect(data.positionZ).toBe(data.planet.positionZ);
    expect(visitedPlanets.some((planet: Planet) => planet.id === 2)).toBe(true);
  });

  it('should award the user with an item', async () => {
    await axiosClient.post('/login', undefined, user1Config);
    await axiosClient.post('/travelingTo/2', undefined, user1Config);

    jest.advanceTimersByTime(1000000000000);

    const { data } = await axiosClient.post('/login', undefined, user1Config);

    // original for landing on earth + new item
    expect(data.items.length).toBe(2);
  });
});

describe('/speedBoost', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2020, 1, 1));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should boost the users speed if speedBoost is called after enough time has passed', async () => {
    await axiosClient.post('/login', undefined, user1Config);
    const result = await axiosClient.post(
      '/travelingTo/2',
      undefined,
      user1Config,
    );

    jest.advanceTimersByTime(8 * 60 * 60 * 1000 + 1);

    const result2 = await axiosClient.post(
      '/speedBoost',
      undefined,
      user1Config,
    );

    expect(result2.data.speed).toBe(result.data.speed * 2);
  });

  it('should return an error if speedBoost is called but not enough time has not passed', async () => {
    await axiosClient.post('/login', undefined, user1Config);
    await axiosClient.post('/travelingTo/2', undefined, user1Config);

    jest.advanceTimersByTime(1);

    const result = await axiosClient.post(
      '/speedBoost',
      undefined,
      user1Config,
    );

    expect(result.status).toBe(400);
  });

  it('should not allow the users speed to be boosted multiple times if speedBoost is rapidly called', async () => {
    await axiosClient.post('/login', undefined, user1Config);
    const result = await axiosClient.post(
      '/travelingTo/2',
      undefined,
      user1Config,
    );

    jest.advanceTimersByTime(8 * 60 * 60 * 1000 + 1);

    await Promise.all([
      axiosClient.post('/speedBoost', undefined, user1Config),
      axiosClient.post('/speedBoost', undefined, user1Config),
      axiosClient.post('/speedBoost', undefined, user1Config),
    ]);

    const result2 = await axiosClient.post('/login', undefined, user1Config);

    expect(result2.data.speed).toBe(result.data.speed * 2);
  });
});
