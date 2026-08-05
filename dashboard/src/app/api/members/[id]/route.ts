import { updateMember } from "@/lib/members";
import { getSameOrigin, isUserAdministrator } from "@/lib/user-administration";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!getSameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (!await isUserAdministrator()) return Response.json({ error: "Only an administrator can update members." }, { status: 403 });

  const { id } = await params;
  if (!/^\d+$/.test(id)) return Response.json({ error: "Invalid member." }, { status: 400 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: "Invalid update." }, { status: 400 });

  const changes: Parameters<typeof updateMember>[1] = {};

  if (body.fullName !== undefined) {
    if (typeof body.fullName !== "string" || !body.fullName.trim() || body.fullName.trim().length > 160) {
      return Response.json({ error: "Enter a member name between 1 and 160 characters." }, { status: 400 });
    }
    changes.fullName = body.fullName.trim();
  }

  if (body.rosterNumber !== undefined) {
    if (!Number.isInteger(body.rosterNumber) || Number(body.rosterNumber) < 1) {
      return Response.json({ error: "Roster number must be a positive whole number." }, { status: 400 });
    }
    changes.rosterNumber = Number(body.rosterNumber);
  }

  if (body.email !== undefined) {
    if (typeof body.email !== "string") return Response.json({ error: "Invalid email address." }, { status: 400 });
    const email = body.email.trim().toLocaleLowerCase();
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    changes.email = email || null;
  }

  if (body.phone !== undefined) {
    if (typeof body.phone !== "string" || body.phone.trim().length > 40) {
      return Response.json({ error: "Phone number must be 40 characters or fewer." }, { status: 400 });
    }
    changes.phone = body.phone.trim() || null;
  }

  if (body.status !== undefined) {
    if (body.status !== "active" && body.status !== "needs_review") {
      return Response.json({ error: "Invalid member status." }, { status: 400 });
    }
    changes.needsReview = body.status === "needs_review";
  }

  if (Object.keys(changes).length === 0) return Response.json({ error: "Choose a member field to update." }, { status: 400 });

  try {
    const updated = await updateMember(id, changes);
    if (!updated) return Response.json({ error: "Member could not be found." }, { status: 404 });
    return Response.json({ success: "Member updated." });
  } catch (error) {
    if (isDatabaseError(error) && error.code === "23505") {
      return Response.json({ error: "That roster number is already assigned to another member." }, { status: 409 });
    }
    throw error;
  }
}

function isDatabaseError(error: unknown): error is { code?: string } {
  return typeof error === "object" && error !== null && "code" in error;
}
