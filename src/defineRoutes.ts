/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  Connection,
  EntityManager,
  IDatabaseDriver,
  MikroORM,
} from '@mikro-orm/core';
import { User, UserStatus } from './entities/User';
import { setupPlanets } from './setupPlanets';
import { validateUser } from './validateUser';
import * as core from 'express-serve-static-core';
import { Planet } from './entities/Planet';
import { generateName } from './generateName';
import { Username } from './entities/Username';

const getUser = async (
  orm: EntityManager<IDatabaseDriver<Connection>>,
  uid: string,
) => {
  return await orm.findOneOrFail(
    User,
    { uid },
    { populate: ['planet', 'visitedPlanets'] },
  );
};

export const defineRoutes = async (
  app: core.Express,
  orm: MikroORM<IDatabaseDriver<Connection>>,
) => {
  const fork = orm.em.fork();

  await setupPlanets(orm.em.fork());

  app.post('/login', async (req, res) => {
    try {
      const token = await validateUser(req.headers.authorization);

      const user = await fork.findOne(User, { uid: token.uid });

      if (!user) {
        const earth = await fork.findOneOrFail(Planet, { name: 'Earth' });

        const name = generateName();
        const username =
          (await fork.findOne(Username, { name })) ?? new Username(name);

        const user = new User(token.uid, `${name}${username.count}`, earth);
        user.visitedPlanets.add(earth);
        user.positionX = earth.positionX;
        user.positionY = earth.positionY;
        user.positionZ = earth.positionZ;

        username.count++;
        fork.persist(username);
        await fork.persistAndFlush(user);

        res.status(201);
        res.json(await getUser(fork, token.uid));
      } else {
        user.updatePositions();
        await fork.persistAndFlush(user);

        res.status(200);
        res.json(await getUser(fork, token.uid));
      }
    } catch (e) {
      console.error(e);
      res.status(400);
      res.json('An error occured');
    }
  });

  app.get('/planets', async (req, res) => {
    const results = await orm.em.fork().find(Planet, {});

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
    } catch (e) {}
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
      console.error(e);
      res.status(400);
      res.json('An error occurred');
    }
  });
};
