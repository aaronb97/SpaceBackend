import pg from "pg";
const { Pool, Client } = pg;
import express from "express";
import { MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from "./mikro-orm.config";
const app = express();

const port = 3000;

const initOrm = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();
};

initOrm();

const credentials = {
  user: "postgres",
  host: "localhost",
  database: "space",
  password: "postgres",
  port: 5432,
};

const pool = new Pool(credentials);

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
