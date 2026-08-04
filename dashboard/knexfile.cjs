const path = require("node:path");

require("dotenv").config({ path: path.join(__dirname, ".env.local") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Copy .env.example to .env.local and add your Neon connection string.");
}

/** @type {import('knex').Knex.Config} */
module.exports = {
  client: "pg",
  connection: process.env.DATABASE_URL,
  pool: { min: 0, max: 5 },
  migrations: {
    directory: path.join(__dirname, "db", "migrations"),
    extension: "js",
  },
};
