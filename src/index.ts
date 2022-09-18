import { MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from "./mikro-orm.config";
import { app } from "./express";
import { pool } from "./pool";
import { User } from "./entities/User";
import { Planet } from "./entities/Planet";
import { validateUser } from "./validateUser";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  app.post("/login", async (req, res) => {
    try {
      const token = await validateUser(req.headers.authorization);

      const fork = orm.em.fork();

      const user = await fork.findOne(
        User,
        { uid: token.uid },
        { populate: ["planet"] }
      );
      if (!user) {
        const earth = await fork.findOneOrFail(Planet, { name: "Earth" });
        const user = new User(token.uid, `Random ${Math.random()}`, earth);
        await fork.persistAndFlush(user);

        console.log("Successuly created user");
        res.status(201);
        res.json({ user });
      } else {
        console.log("Successuly fetched user info");
        res.status(200);
        res.json({ user });
      }
    } catch (e) {
      console.error(e);
      res.status(400);
      res.json("An error occured");
    }
  });

  app.get("/planets", async (req, res) => {
    const results = await orm.em.fork().find(Planet, {});

    res.json(results);
  });

  app.get("/planets/:id", async (req, res) => {
    try {
      const result = await orm.em
        .fork()
        .findOneOrFail(Planet, { id: Number(req.params.id) });

      res.json(result);
    } catch {
      res.status(404);
      res.json("Planet not found");
    }
  });

  app.post("/users/:id/speedboost", async (req, res) => {
    try {
      const user = await pool.query(
        "SELECT * from users WHERE user_id = $1 AND last_boost < current_timestamp - interval '12 hour'",
        [req.params.id]
      );

      if (!user.rowCount) {
        res.json("User did not recieve speed boost");
        return;
      }

      await pool.query(
        "UPDATE users SET last_boost = current_timestamp WHERE user_id = $1",
        [req.params.id]
      );
      res.status(200);
      res.json("User recieved speed boost");
    } catch (e) {
      console.log(e);
      res.status(500);
    }
  });
};

main();

const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
