import "server-only";

import { database } from "@/lib/db";

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string | null;
  banned: boolean;
  createdAt: string;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string | null;
  banned: boolean | null;
  createdAt: Date | string;
};

export async function listUsers(): Promise<DashboardUser[]> {
  const rows = await database()<UserRow>("user")
    .withSchema("neon_auth")
    .select("id", "name", "email", "emailVerified", "role", "banned", "createdAt")
    .orderBy("createdAt", "desc");

  return rows.map((row) => ({
    id: String(row.id),
    name: row.name,
    email: row.email,
    emailVerified: row.emailVerified,
    role: row.role,
    banned: Boolean(row.banned),
    createdAt: new Date(row.createdAt).toISOString(),
  }));
}

export async function countUsers(): Promise<number> {
  const result = await database()("user")
    .withSchema("neon_auth")
    .where("emailVerified", true)
    .count<{ count: string }>("id as count")
    .first();

  return Number(result?.count ?? 0);
}
