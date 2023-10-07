import pg from "pg";

const { Pool } = pg;

export const getClient = (ssl: boolean) =>
  new Pool({
    ssl,
    application_name: process.env.POD_NAME || "rewire-unknown",
  });
