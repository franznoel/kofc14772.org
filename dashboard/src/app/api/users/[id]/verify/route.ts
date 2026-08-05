import { getSameOrigin, isUserAdministrator, verifyUser } from "@/lib/user-administration";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!getSameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });

  if (!await isUserAdministrator()) {
    return Response.json({ error: "Only an administrator can verify users." }, { status: 403 });
  }

  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: "Invalid user." }, { status: 400 });

  const updated = await verifyUser(id);
  if (!updated) return Response.json({ error: "This user was already verified or could not be found." }, { status: 409 });

  return Response.json({ success: "User verified." });
}
