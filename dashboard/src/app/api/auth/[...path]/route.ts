import { auth } from "@/lib/auth/server";
import { isActiveMemberEmail } from "@/lib/members";

const handlers = auth.handler();

export const GET = handlers.GET;

type AuthRouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function POST(request: Request, context: AuthRouteContext) {
  const { path } = await context.params;

  if (path.join("/") === "sign-up/email") {
    const body = await request.clone().json().catch(() => null) as Record<string, unknown> | null;
    const email = typeof body?.email === "string" ? body.email : "";

    if (!await isActiveMemberEmail(email)) {
      return Response.json(
        { message: "This email address is not listed on the active council roster." },
        { status: 403 },
      );
    }
  }

  return handlers.POST(request, context);
}
