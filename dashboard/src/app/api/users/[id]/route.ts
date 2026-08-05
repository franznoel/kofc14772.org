import { auth } from "@/lib/auth/server";
import {
  deleteUser,
  getInitialOwnerId,
  getSameOrigin,
  isUserAdministrator,
  updateUserAdministration,
} from "@/lib/user-administration";

function validUserId(id: string): boolean {
  return /^[0-9a-f-]{36}$/i.test(id);
}

async function mutationContext(request: Request, id: string) {
  if (!getSameOrigin(request)) return { error: "Invalid request origin.", status: 403 };
  if (!await isUserAdministrator()) return { error: "Only an administrator can manage users.", status: 403 };
  if (!validUserId(id)) return { error: "Invalid user.", status: 400 };

  const [{ data: session }, ownerId] = await Promise.all([auth.getSession(), getInitialOwnerId()]);
  return { actorId: session?.user?.id ?? null, ownerId };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const context = await mutationContext(request, id);
  if ("error" in context) return Response.json({ error: context.error }, { status: context.status });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = typeof body?.name === "string" ? body.name.trim() : undefined;
  const role = body?.role;
  const status = body?.status;

  if (body?.name !== undefined && (!name || name.length > 120)) {
    return Response.json({ error: "Enter a name between 1 and 120 characters." }, { status: 400 });
  }
  if (role !== undefined && role !== "user" && role !== "admin") {
    return Response.json({ error: "Invalid role." }, { status: 400 });
  }
  if (status !== undefined && status !== "active" && status !== "banned") {
    return Response.json({ error: "Invalid status." }, { status: 400 });
  }
  if (name === undefined && role === undefined && status === undefined) {
    return Response.json({ error: "Choose a name, role, or status to update." }, { status: 400 });
  }
  if (status === "banned" && (id === context.actorId || id === context.ownerId)) {
    return Response.json({ error: "The current user and initial owner cannot be banned." }, { status: 409 });
  }

  const updated = await updateUserAdministration(id, {
    name,
    role: role as "user" | "admin" | undefined,
    status: status as "active" | "banned" | undefined,
  });
  if (!updated) return Response.json({ error: "User could not be found." }, { status: 404 });

  return Response.json({ success: "User updated." });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const context = await mutationContext(request, id);
  if ("error" in context) return Response.json({ error: context.error }, { status: context.status });

  if (id === context.actorId) return Response.json({ error: "You cannot delete your own account." }, { status: 409 });
  if (id === context.ownerId) return Response.json({ error: "The initial owner account cannot be deleted." }, { status: 409 });

  const deleted = await deleteUser(id);
  if (!deleted) return Response.json({ error: "User could not be found." }, { status: 404 });

  return Response.json({ success: "User deleted." });
}
