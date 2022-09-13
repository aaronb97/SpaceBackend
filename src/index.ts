import pg from "pg";
const { Pool, Client } = pg;
import express from "express";
const app = express();

const port = 3000;

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
