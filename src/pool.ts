import pg from "pg";
const { Pool, Client } = pg;

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "space",
  password: "postgres",
  port: 5432,
});
