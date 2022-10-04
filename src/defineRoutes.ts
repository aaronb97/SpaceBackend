/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  Connection,
  EntityManager,
  IDatabaseDriver,
  MikroORM,
} from '@mikro-orm/core';
import { User, UserStatus } from './entities/User';
import { validateUser } from './validateUser';
import * as core from 'express-serve-static-core';
import { Planet } from './entities/Planet';
import { generateName } from './generateName';
import { generateWelcomeText } from './generateWelcomeText';
import { getRandomElement } from './getRandomElement';
import { quotes } from './quotes';
import { UserGroup } from './entities/UserGroup';

const getUser = async (
  orm: EntityManager<IDatabaseDriver<Connection>>,
  uid: string,
) => {
  return await orm.findOneOrFail(
    User,
    { uid },
    {
      fields: [
        'planet',
        'visitedPlanets.name',
        'visitedPlanets.id',
        'items.name',
        'items.rarity',
        'groups.name',
        'groups.users.username',
        'positionX',
        'positionY',
        'positionZ',
        'speed',
        'status',
        'nextBoost',
        'landingTime',
      ],
    },
  );
};

export const defineRoutes = async (
  app: core.Express,
  orm: MikroORM<IDatabaseDriver<Connection>>,
) => {
  const fork = orm.em.fork();

  app.post('/login', async (req, res) => {
    try {
      const token = await validateUser(req.headers.authorization);

      const user = await fork.findOne(
        User,
        { uid: token.uid },
        { populate: ['items', 'planet', 'planet.items', 'visitedPlanets'] },
      );

      if (!user) {
        const earth = await fork.findOneOrFail(
          Planet,
          { name: 'Earth' },
          { populate: ['items'] },
        );

        let name;
        do {
          name = generateName();
        } while (await fork.findOne(User, { username: name }));

        const user = new User(token.uid, name, earth);
        user.landOnPlanet(earth);
        user.notification = generateWelcomeText();

        await fork.persistAndFlush(user);

        res.status(201);

        res.json(await getUser(fork, token.uid));

        user.notification = undefined;
      } else {
        user.updatePositions();
        await fork.persistAndFlush(user);

        if (!user.notification && Math.random() < 0.01) {
          user.notification = getRandomElement(quotes);
        }

        res.status(200);
        res.json(await getUser(fork, token.uid));

        user.notification = undefined;
      }
    } catch (e) {
      console.error('Error', e);
      res.status(400);
      res.json('An error occured');
    }
  });

  app.get('/planets', async (req, res) => {
    const results = await orm.em
      .fork()
      .find(Planet, {}, { populate: ['orbiting'] });

    res.json(results);
  });

  app.get('/planets/:id', async (req, res) => {
    try {
      const result = await orm.em
        .fork()
        .findOneOrFail(Planet, { id: Number(req.params.id) });

      res.json(result);
    } catch {
      res.status(404);
      res.json('Planet not found');
    }
  });

  app.post('/speedboost', async (req, res) => {
    try {
      const token = await validateUser(req.headers.authorization);

      const user = await getUser(fork, token.uid);

      if (user.status !== UserStatus.TRAVELING || !user.nextBoost) {
        res.status(400);
        res.json('User is not traveling');
        return;
      }

      const time = new Date();

      if (user.nextBoost.getTime() <= time.getTime()) {
        user.speedBoost();
        user.setLandingTime();
        user.updateNextBoost();

        await fork.persistAndFlush(user);

        res.status(200);
        res.json(await getUser(fork, token.uid));
      } else {
        res.status(400);
        res.json('User can not recieve speed boost yet');
      }
    } catch (e) {
      console.error('Error', e);
      res.status(400);
      res.json('An error occurred');
    }
  });

  app.post('/travelingTo/:id', async (req, res) => {
    try {
      const token = await validateUser(req.headers.authorization);

      const user = await getUser(fork, token.uid);

      const planet = await fork.findOne(Planet, {
        id: Number(req.params.id),
      });

      if (!planet) {
        res.status(404);
        res.json(`Planet with id ${req.params.id} not found`);
        return;
      }

      if (planet.id === user.planet.id) {
        res.status(400);
        res.json('User is already traveling to planet with id' + req.params.id);
        return;
      }

      user.updatePositions();
      user.updateNextBoost();
      user.startTraveling(planet);

      await fork.persistAndFlush(user);
      res.json(await getUser(fork, token.uid));
    } catch (e) {
      console.error('Error', e);
      res.status(400);
      res.json('An error occurred');
    }
  });

  app.get('/userGroups', async (req, res) => {
    const token = await validateUser(req.headers.authorization);
    const user = await getUser(fork, token.uid);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const groupIds = user.groups.getIdentifiers() as number[];

    const groups = await fork.find(UserGroup, { id: { $in: groupIds } });

    res.json(groups);
  });

  app.post('/userGroups', async (req, res) => {
    try {
      const token = await validateUser(req.headers.authorization);
      const user = await getUser(fork, token.uid);

      console.log(req.body);

      if (!req.body.name || typeof req.body.name !== 'string') {
        res.status(400);
        res.json('Invalid userGroup name');
        return;
      }

      const group = new UserGroup();
      group.name = req.body.name;
      group.users.add(user);

      await fork.persistAndFlush(group);
      res.json('Successfully created group');
    } catch (e) {
      console.error('Error', e);
      res.status(400);
      res.json('An error occurred');
    }
  });
};
