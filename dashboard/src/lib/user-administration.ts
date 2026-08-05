import "server-only";

import { auth } from "@/lib/auth/server";
import { database } from "@/lib/db";

export function getSameOrigin(request: Request): string | null {
  const requestOrigin = new URL(request.url).origin;
  const originHeader = request.headers.get("origin");

  return originHeader === requestOrigin ? requestOrigin : null;
}

export async function isUserAdministrator(): Promise<boolean> {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return false;

  const currentUser = await database()("user")
    .withSchema("neon_auth")
    .select("id", "role")
    .where("id", session.user.id)
    .first<{ id: string; role: string | null }>();

  if (!currentUser) return false;
  if (currentUser.role?.toLocaleLowerCase() === "admin") return true;

  const owner = await database()("user")
    .withSchema("neon_auth")
    .select("id")
    .orderBy("createdAt", "asc")
    .first<{ id: string }>();

  return owner?.id === currentUser.id;
}

export async function verifyUser(userId: string): Promise<boolean> {
  const updated = await database()("user")
    .withSchema("neon_auth")
    .where({ id: userId, emailVerified: false })
    .update({ emailVerified: true, updatedAt: new Date() });

  return updated > 0;
}

export async function getInitialOwnerId(): Promise<string | null> {
  const owner = await database()("user")
    .withSchema("neon_auth")
    .select("id")
    .orderBy("createdAt", "asc")
    .first<{ id: string }>();

  return owner?.id ?? null;
}

export async function updateUserAdministration(
  userId: string,
  changes: { name?: string; role?: "user" | "admin"; status?: "active" | "banned" },
): Promise<boolean> {
  const update: Record<string, unknown> = { updatedAt: new Date() };

  if (changes.name) update.name = changes.name;
  if (changes.role) update.role = changes.role;
  if (changes.status) {
    update.banned = changes.status === "banned";
    update.banReason = changes.status === "banned" ? "Disabled by dashboard administrator" : null;
    update.banExpires = null;
  }

  const updated = await database()("user")
    .withSchema("neon_auth")
    .where("id", userId)
    .update(update);

  return updated > 0;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const deleted = await database()("user")
    .withSchema("neon_auth")
    .where("id", userId)
    .delete();

  return deleted > 0;
}
