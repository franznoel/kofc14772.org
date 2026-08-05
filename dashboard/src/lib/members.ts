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
