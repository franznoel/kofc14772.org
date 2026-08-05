import "server-only";

import { database } from "@/lib/db";

export type Member = {
  id: string;
  rosterNumber: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  needsReview: boolean;
};

type MemberRow = {
  id: string;
  roster_number: number;
  full_name: string;
  phone: string | null;
  email: string | null;
  needs_review: boolean;
};

export async function listMembers(): Promise<Member[]> {
  const rows = await database()<MemberRow>("members")
    .select("id", "roster_number", "full_name", "phone", "email", "needs_review")
    .where("is_active", true)
    .orderBy("full_name", "asc");

  return rows.map((row) => ({
    id: String(row.id),
    rosterNumber: row.roster_number,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    needsReview: row.needs_review,
  }));
}

export async function countMembers(): Promise<number> {
  const result = await database()("members")
    .where("is_active", true)
    .count<{ count: string }>("id as count")
    .first();

  return Number(result?.count ?? 0);
}

export async function updateMember(
  memberId: string,
  changes: {
    rosterNumber?: number;
    fullName?: string;
    phone?: string | null;
    email?: string | null;
    needsReview?: boolean;
  },
): Promise<boolean> {
  const update: Record<string, unknown> = { updated_at: new Date() };

  if (changes.rosterNumber !== undefined) update.roster_number = changes.rosterNumber;
  if (changes.fullName !== undefined) update.full_name = changes.fullName;
  if (changes.phone !== undefined) update.phone = changes.phone;
  if (changes.email !== undefined) update.email = changes.email;
  if (changes.needsReview !== undefined) update.needs_review = changes.needsReview;

  const updated = await database()("members")
    .where({ id: memberId, is_active: true })
    .update(update);

  return updated > 0;
}
