import "server-only";

import knex, { type Knex } from "knex";

const globalForDatabase = globalThis as typeof globalThis & {
  dashboardDatabase?: Knex;
};

function createDatabase(): Knex {
  const connection = process.env.DATABASE_URL;

  if (!connection) {
    throw new Error("DATABASE_URL is required to connect to Neon.");
  }

  return knex({
    client: "pg",
    connection,
    pool: { min: 0, max: 5 },
    acquireConnectionTimeout: 10_000,
  });
}

export function database(): Knex {
  globalForDatabase.dashboardDatabase ??= createDatabase();
  return globalForDatabase.dashboardDatabase;
}
