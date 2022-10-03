import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core';
import { Item } from './entities/Item';
import { Planet } from './entities/Planet';
import { PlanetPrototype } from './planets';

export const setupPlanets = async (
  orm: EntityManager<IDatabaseDriver<Connection>>,
  planets: PlanetPrototype[],
) => {
  for (const planet of planets) {
    const [attr, options] = planet;
    const [name, x, y, z] = attr;

    let entity = await orm.findOne(Planet, { name });
    if (!entity) {
      entity = new Planet(name, 0, options?.type ?? 'planet');

      entity.items.add(new Item(`${name} trophy`, 'common', entity));
      entity.items.add(new Item(`${name} trophy`, 'rare', entity));
      entity.items.add(new Item(`${name} trophy`, 'legendary', entity));
    }

    if (options?.radius) {
      entity.radius = options.radius;
    }

    entity.positionX = x;
    entity.positionY = y;
    entity.positionZ = z;

    orm.persist(entity);
  }

  await orm.flush();
};
