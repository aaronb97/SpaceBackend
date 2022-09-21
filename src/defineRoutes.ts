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

const getUser = async (
  orm: EntityManager<IDatabaseDriver<Connection>>,
  uid: string,
) => {
  return await orm.findOneOrFail(User, { uid }, { populate: ['planet'] });
};

export const defineRoutes = async (
  app: core.Express,
  orm: MikroORM<IDatabaseDriver<Connection>>,
) => {
  await orm.getMigrator().up();

  const loginFork = orm.em.fork();

  await setupPlanets(orm.em.fork());

  app.post('/login', async (req, res) => {
    try {
      const token = await validateUser(req.headers.authorization);

      const fork = loginFork;

      const user = await fork.findOne(
        User,
        { uid: token.uid },
        { populate: ['planet'] },
      );
      if (!user) {
        const earth = await fork.findOneOrFail(Planet, { name: 'Earth' });
        const user = new User(token.uid, `Random ${Math.random()}`, earth);
        user.positionX = earth.positionX;
        user.positionY = earth.positionY;
        user.positionZ = earth.positionZ;
        await fork.persistAndFlush(user);

        console.log('Successuly created user');
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

  const speedBoostFork = orm.em.fork();

  app.post('/speedboost', async (req, res) => {
    try {
      const token = await validateUser(req.headers.authorization);

      const fork = speedBoostFork;

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

      const fork = orm.em.fork();

      const user = await getUser(fork, token.uid);

      const planet = await fork.findOneOrFail(Planet, {
        id: Number(req.params.id),
      });

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