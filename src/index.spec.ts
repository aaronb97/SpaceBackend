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
import { PlanetPrototype } from './planets';
import { setupPlanets } from './setupPlanets';
import { calculateDist } from './calculateDist';

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
  expressApp.use(express.urlencoded({ extended: true }));
  expressApp.use(express.json());
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

const EARTH_RADIUS = 1000;

const mockPlanets: PlanetPrototype[] = [
  [['Earth', 0, 0, 1e8], { radius: EARTH_RADIUS }],
  [['The Sun', 0, 0, 0], { radius: 10000 }],
  [['The Moon', 0, 0, 1.1e8], { radius: 100 }],
];

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
  await setupPlanets(orm.em.fork(), mockPlanets);
  await defineRoutes(expressApp, orm);
});

afterEach(async () => {
  await orm.em.nativeDelete('user', {});
  await orm.em.nativeDelete('user_group', {});
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

const user2Config = {
  headers: {
    authorization: 'user2',
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

  it('there should be a notification when logging in for the first time', async () => {
    const result = await axiosClient.post('/login', undefined, user1Config);

    expect(result.data.notification.includes('Welcome')).toBe(true);
  });

  it('there should not be a notification when logging in for the second time', async () => {
    await axiosClient.post('/login', undefined, user1Config);
    const result = await axiosClient.post('/login', undefined, user1Config);

    expect(result.data.notification).toBeUndefined();
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
    expect(result.status).toBe(201);

    await axiosClient.post('/travelingTo/2', undefined, user1Config);

    jest.advanceTimersByTime(1000);

    const result2 = await axiosClient.post('/login', undefined, user1Config);
    expect(result2.status).toBe(200);

    const data1 = result.data;
    const data2 = result2.data;

    expect(
      data1.positionX !== data2.positionX ||
        data1.positionY !== data2.positionY ||
        data1.positionZ !== data2.positionZ,
    ).toBe(true);
  });

  it('should update users positions after starting to travel to be on the edge of the starting planet', async () => {
    const result = await axiosClient.post('/login', undefined, user1Config);

    await axiosClient.post('/travelingTo/2', undefined, user1Config);

    const result2 = await axiosClient.post('/login', undefined, user1Config);

    const data1 = result.data;
    const data2 = result2.data;

    expect(calculateDist(data1, data2)).toBe(EARTH_RADIUS);
  });

  it('should not update users positions after starting to travel if the user is already traveling', async () => {
    await axiosClient.post('/login', undefined, user1Config);

    await axiosClient.post('/travelingTo/2', undefined, user1Config);

    jest.advanceTimersByTime(1000);

    const result1 = await axiosClient.post('/login', undefined, user1Config);

    await axiosClient.post('/travelingTo/1', undefined, user1Config);

    const result2 = await axiosClient.post('/login', undefined, user1Config);

    const data1 = result1.data;
    const data2 = result2.data;

    expect(calculateDist(data1, data2)).toBe(0);
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
    expect(data.notification.includes('Welcome')).toBe(true);
  });

  it('two users should be able to visit planets', async () => {
    await axiosClient.post('/login', undefined, user1Config);
    await axiosClient.post('/travelingTo/2', undefined, user1Config);
    await axiosClient.post('/login', undefined, user2Config);
    await axiosClient.post('/travelingTo/2', undefined, user2Config);

    jest.advanceTimersByTime(1000000000000);

    const { data } = await axiosClient.post('/login', undefined, user1Config);
    const { data: data2 } = await axiosClient.post(
      '/login',
      undefined,
      user2Config,
    );

    expect(data.visitedPlanets.length).toBe(2);
    expect(data2.visitedPlanets.length).toBe(2);
  });

  it('leaving and then landing again should not increase the number of visitedPlanets', async () => {
    const { data: data1 } = await axiosClient.post(
      '/login',
      undefined,
      user1Config,
    );

    expect(data1.visitedPlanets.length).toBe(1);
    await axiosClient.post('/travelingTo/2', undefined, user1Config);

    jest.advanceTimersByTime(1000000000000);

    const { data: data2 } = await axiosClient.post(
      '/login',
      undefined,
      user1Config,
    );
    expect(data2.visitedPlanets.length).toBe(2);

    await axiosClient.post('/travelingTo/1', undefined, user1Config);
    jest.advanceTimersByTime(1000000000000);

    const { data: data3 } = await axiosClient.post(
      '/login',
      undefined,
      user1Config,
    );
    expect(data3.visitedPlanets.length).toBe(2);
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
    expect(
      result2.data.notification.includes(
        `Your speed has been boosted from 40,000 to 80,000!`,
      ),
    ).toBe(true);
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

describe('userGroups', () => {
  it('creating a group without a name should return an error', async () => {
    await axiosClient.post('/login', undefined, user1Config);

    const result = await axiosClient.post(
      '/userGroups',
      undefined,
      user1Config,
    );

    expect(result.status).toBe(400);
  });

  it('should allow users to create groups', async () => {
    const result0 = await axiosClient.post('/login', undefined, user1Config);
    expect(result0.data.groups.length).toBe(0);

    const groupStatus = await axiosClient.post(
      '/userGroups',
      { name: 'New Usergroup' },
      user1Config,
    );

    expect(groupStatus.status).toBe(200);

    const result = await axiosClient.post('/login', undefined, user1Config);

    expect(result.data.groups.length).toBe(1);
  });

  it('should allow users to join groups', async () => {
    await axiosClient.post('/login', undefined, user1Config);
    await axiosClient.post('/login', undefined, user2Config);

    const group = await axiosClient.post(
      '/userGroups',
      { name: 'New Usergroup' },
      user1Config,
    );

    expect(group.data.users.length).toBe(1);

    const uuid = group.data.uuid;

    const result = await axiosClient.post(
      `joinGroup/${uuid}`,
      undefined,
      user2Config,
    );

    expect(result.data.groups[0].users.length).toBe(2);
  });

  it('internal details of users from other groups should not be visible', async () => {
    await axiosClient.post('/login', undefined, user1Config);
    const user2Login = await axiosClient.post('/login', undefined, user2Config);
    const user2Username = user2Login.data.username;

    const group = await axiosClient.post(
      '/userGroups',
      { name: 'New Usergroup' },
      user1Config,
    );

    const uuid = group.data.uuid;

    await axiosClient.post(`joinGroup/${uuid}`, undefined, user2Config);

    const result = await axiosClient.post('/login', undefined, user1Config);
    console.log(result.data.groups[0].users);
    const user2 = result.data.groups[0].users.find(
      (user: { username: any }) => user.username === user2Username,
    );

    expect(user2.username).toBeDefined();
    expect(user2.uid).toBeUndefined();
    expect(user2.uuid).toBeUndefined();
  });
});
