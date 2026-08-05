import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

if (!baseUrl) {
  throw new Error("NEON_AUTH_BASE_URL is required.");
}

const authUrl = new URL(baseUrl);

if (authUrl.protocol !== "https:" || authUrl.username || authUrl.password) {
  throw new Error(
    "NEON_AUTH_BASE_URL must be the HTTPS Neon Auth endpoint, not DATABASE_URL.",
  );
}

if (!cookieSecret || cookieSecret.length < 32) {
  throw new Error("NEON_AUTH_COOKIE_SECRET must contain at least 32 characters.");
}

export const auth = createNeonAuth({
  baseUrl: authUrl.toString().replace(/\/$/, ""),
  cookies: {
    secret: cookieSecret,
  },
});
