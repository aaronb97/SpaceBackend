import { MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from "./mikro-orm.config";
import { applicationDefault } from "firebase-admin/app";
import admin from "firebase-admin";
import { app } from "./express";
import { pool } from "./pool";

const firebaseApp = admin.initializeApp({
  credential: applicationDefault(),
});

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  app.post("/login", async (req, res) => {
    const { authorization } = req.headers;
    if (!authorization) {
      res.status(400);
      res.json("Must specifiy auth token");
      return;
    }

    if (!authorization.startsWith("Bearer ")) {
      res.status(400);
      res.json("Invalid token");
      return;
    }

    try {
      const token = await firebaseApp
        .auth()
        .verifyIdToken(authorization.substring(7, authorization.length));

      res.status(200);
      res.json("Successfully logged in");
    } catch (e) {
      console.error(e);
      res.status(400);
      res.json("Invalid token");
    }
  });

  app.get("/planets", async (req, res) => {
    const result = await pool.query("SELECT * from planets");

    res.json(result.rows);
  });

  app.get("/planets/:id", async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * from planets WHERE planet_id = $1",
        [req.params.id]
      );

      res.json(result.rows);
    } catch (e) {
      console.log(e);
      res.status(500);
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
