import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core';
import { Planet } from './entities/Planet';
import { planets } from './planets';

export const setupPlanets = async (
  orm: EntityManager<IDatabaseDriver<Connection>>,
) => {
  for (const planet of planets) {
    const [attr, options] = planet;
    const [name, x, y, z] = attr;

    const entity =
      (await orm.findOne(Planet, { name })) ??
      new Planet(name, 0, options?.type ?? 'planet');

    entity.positionX = x;
    entity.positionY = y;
    entity.positionZ = z;

    orm.persist(entity);
  }

  await orm.flush();
};
