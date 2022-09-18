import pg from "pg";
const { Pool, Client } = pg;
import express from "express";
import { MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from "./mikro-orm.config";
import cors from "cors";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import admin from "firebase-admin";

const app = express();

const port = 3000;

const firebaseApp = admin.initializeApp({
  credential: applicationDefault(),
});

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

app.use(cors({ origin: "http://localhost:1234" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  // to allow cross domain requests to send cookie information.
  res.header("Access-Control-Allow-Credentials", "true");

  // origin can not be '*' when crendentials are enabled. so need to set it to the request origin
  res.header("Access-Control-Allow-Origin", req.headers.origin);

  // list of methods that are supported by the server
  res.header("Access-Control-Allow-Methods", "OPTIONS,GET,PUT,POST,DELETE");

  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, X-XSRF-TOKEN"
  );

  next();
});

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
    const decodedToken = await firebaseApp
      .auth()
      .verifyIdToken(authorization.substring(7, authorization.length));
    console.log(decodedToken);
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
