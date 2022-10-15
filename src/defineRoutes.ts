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
import { generateColor } from './generateColor';

const serializeUser = async (
  orm: EntityManager<IDatabaseDriver<Connection>>,
  uid: string,
) => {
  return await orm.findOneOrFail(
    User,
    { uid },
    {
      fields: [
        'updatedAt',
        'planet',
        'visitedPlanets.name',
        'visitedPlanets.id',
        'items.name',
        'items.rarity',
        'groups.name',
        'groups.users.username',
        'groups.users.color',
        'groups.users.positionX',
        'groups.users.positionY',
        'groups.users.positionZ',
        'groups.users.xp',
        'groups.uuid',
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

class TransactionError extends Error {
  constructor(public message: string, public code: number) {
    super();
  }
}

const handleError = (
  e: unknown,
  res: core.Response<any, Record<string, any>, number>,
) => {
  if (e instanceof TransactionError) {
    console.error('Transaction eror', e);
    res.status(e.code);
    res.json(e.message);
    return;
  }

  console.error('Error', e);
  res.status(400);
  res.json('Unknown error occured');
};

export const defineRoutes = async (
  app: core.Express,
  orm: MikroORM<IDatabaseDriver<Connection>>,
) => {
  app.post('/login', async (req, res) => {
    try {
      const fork = orm.em.fork();
      await fork.transactional(async (em) => {
        const token = await validateUser(req.headers.authorization);

        const user = await em.findOne(
          User,
          { uid: token.uid },
          {
            populate: ['items', 'planet', 'planet.items', 'visitedPlanets'],
          },
        );

        if (!user) {
          const earth = await em.findOneOrFail(
            Planet,
            { name: 'Earth' },
            { populate: ['items'] },
          );

          let name;
          do {
            name = generateName();
          } while (await em.findOne(User, { username: name }));

          const user = new User(token.uid, name, earth);
          user.landOnPlanet(earth);
          user.notification = generateWelcomeText();

          await em.persistAndFlush(user);

          res.status(201);

          res.json(await serializeUser(orm.em, token.uid));

          user.notification = undefined;
        } else {
          if (!user.color) {
            user.color = generateColor();
          }

          user.updatePositions();
          await em.persistAndFlush(user);

          if (!user.notification && Math.random() < 0.01) {
            user.notification = getRandomElement(quotes);
          }

          res.status(200);
          res.json(await serializeUser(orm.em, token.uid));

          user.notification = undefined;
        }
      });
    } catch (e) {
      handleError(e, res);
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
      const fork = orm.em.fork();
      await fork.transactional(async (em) => {
        const token = await validateUser(req.headers.authorization);

        const user = await em.findOneOrFail(
          User,
          { uid: token.uid },
          { populate: ['planet'] },
        );

        if (user.status !== UserStatus.TRAVELING || !user.nextBoost) {
          throw new TransactionError('User is not traveling', 400);
        }

        const time = new Date();

        if (user.nextBoost.getTime() <= time.getTime()) {
          user.speedBoost();
          user.setLandingTime();
          user.updateNextBoost();

          await em.persistAndFlush(user);

          res.status(200);

          res.json(user);
        } else {
          throw new TransactionError(
            'User can not recieve speed boost yet',
            400,
          );
        }
      });
    } catch (e) {
      handleError(e, res);
    }
  });

  app.post('/travelingTo/:id', async (req, res) => {
    try {
      const em = orm.em.fork();
      const token = await validateUser(req.headers.authorization);

      await em.transactional(async (em) => {
        const user = await em.findOneOrFail(
          User,
          { uid: token.uid },
          { populate: ['planet'] },
        );

        const planet = await em.findOne(Planet, {
          id: Number(req.params.id),
        });

        if (!planet) {
          throw new TransactionError(
            `Planet with id ${req.params.id} not found`,
            404,
          );
        }

        if (planet.id === user.planet.id) {
          throw new TransactionError(
            `User is already traveling to planet with id ${req.params.id}`,
            400,
          );
        }

        user.updatePositions();
        user.updateNextBoost();
        user.startTraveling(planet);

        await em.persistAndFlush(user);
        res.json(await serializeUser(em, token.uid));
      });
    } catch (e) {
      handleError(e, res);
    }
  });

  app.post('/teleport/:id', async (req, res) => {
    const fork = orm.em.fork();
    try {
      const token = await validateUser(req.headers.authorization);

      const user = await fork.findOneOrFail(
        User,
        { uid: token.uid },
        { populate: ['planet', 'visitedPlanets'] },
      );

      if (!user.godmode) {
        res.status(401);
        return;
      }

      const planet = await fork.findOne(Planet, {
        id: Number(req.params.id),
      });

      if (!planet) {
        throw new TransactionError(
          `Planet with id ${req.params.id} not found`,
          404,
        );
      }

      user.landOnPlanet(planet, false);
      user.updatePositions();

      await fork.persistAndFlush(user);
      res.json(await serializeUser(orm.em.fork(), token.uid));
    } catch (e) {
      handleError(e, res);
    }
  });

  app.get('/userGroups', async (req, res) => {
    const fork = orm.em.fork();
    const token = await validateUser(req.headers.authorization);
    const user = await serializeUser(orm.em, token.uid);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const groupIds = user.groups.getIdentifiers() as number[];

    const groups = await fork.find(UserGroup, { id: { $in: groupIds } });

    res.json(groups);
  });

  app.post('/userGroups', async (req, res) => {
    try {
      const fork = orm.em.fork();
      await fork.transactional(async (em) => {
        const token = await validateUser(req.headers.authorization);
        const user = await em.findOneOrFail(User, { uid: token.uid });

        if (
          !req.body.name ||
          typeof req.body.name !== 'string' ||
          req.body.name.length > 20
        ) {
          throw new TransactionError('Invalid userGroup name', 400);
        }

        if (await em.findOne(UserGroup, { name: req.body.name })) {
          throw new TransactionError('Group name already exists', 400);
        }

        const group = new UserGroup();
        group.name = req.body.name;
        group.users.add(user);

        await em.persistAndFlush(group);
        res.json(group);
      });
    } catch (e) {
      handleError(e, res);
    }
  });

  app.post('/joinGroup/:uuid', async (req, res) => {
    try {
      const fork = orm.em.fork();
      const token = await validateUser(req.headers.authorization);
      await fork.transactional(async (em) => {
        const user = await em.findOneOrFail(
          User,
          { uid: token.uid },
          { populate: ['groups'] },
        );

        const uuid = req.params.uuid;

        if (!req.params.uuid) {
          throw new TransactionError('Invalid uuid', 400);
        }

        const group = await em.findOne(UserGroup, { uuid });
        if (!group) {
          throw new TransactionError('Group not found', 404);
        }

        if (user.groups.contains(group)) {
          throw new TransactionError('User is already in group', 400);
        }

        group.users.add(user);

        em.persist(group);

        return user;
      });

      res.json(await serializeUser(fork, token.uid));
    } catch (e) {
      handleError(e, res);
    }
  });
};
