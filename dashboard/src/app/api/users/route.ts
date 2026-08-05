import { getSameOrigin, isUserAdministrator } from "@/lib/user-administration";

export async function POST(request: Request) {
  const origin = getSameOrigin(request);
  if (!origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });

  if (!await isUserAdministrator()) {
    return Response.json({ error: "Only an administrator can add users." }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLocaleLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || !password) return Response.json({ error: "Complete all fields." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 8) return Response.json({ error: "Use an initial password with at least 8 characters." }, { status: 400 });

  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  if (!baseUrl) return Response.json({ error: "Neon Auth is not configured." }, { status: 500 });

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/sign-up/email`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin,
    },
    body: JSON.stringify({
      name,
      email,
      password,
      callbackURL: `${origin}/auth/sign-in`,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string } | null;
    return Response.json({ error: payload?.message || "Unable to add this user." }, { status: response.status });
  }

  return Response.json({ success: `${name} was added. Their email is not verified yet.` }, { status: 201 });
}
