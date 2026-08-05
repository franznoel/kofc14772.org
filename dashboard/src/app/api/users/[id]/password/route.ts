import { auth } from "@/lib/auth/server";
import { getSameOrigin, isUserAdministrator } from "@/lib/user-administration";

function validUserId(id: string): boolean {
  return /^[0-9a-f-]{36}$/i.test(id);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!getSameOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!await isUserAdministrator()) {
    return Response.json({ error: "Only an administrator can change user passwords." }, { status: 403 });
  }
  if (!validUserId(id)) {
    return Response.json({ error: "Invalid user." }, { status: 400 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (newPassword.length < 8 || newPassword.length > 128) {
    return Response.json({ error: "Use a password between 8 and 128 characters." }, { status: 400 });
  }

  const admin = auth.admin as {
    setUserPassword(input: { userId: string; newPassword: string }): Promise<{
      error: { message?: string } | null;
    }>;
  };
  const { error } = await admin.setUserPassword({ userId: id, newPassword });
  if (error) {
    return Response.json({ error: error.message || "Unable to change this password." }, { status: 400 });
  }

  return Response.json({ success: "Password changed." });
}
