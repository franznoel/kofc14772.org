"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { isActiveMemberEmail } from "@/lib/members";

export type AuthActionState = { error?: string };

function requiredText(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function signInAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = requiredText(formData, "email");
  const password = requiredText(formData, "password");

  if (!email || !password) return { error: "Enter your email address and password." };

  const { error } = await auth.signIn.email({ email, password });
  if (error) return { error: error.message || "Unable to sign in." };
  redirect("/");
}

export async function signUpAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const name = requiredText(formData, "name");
  const email = requiredText(formData, "email");
  const password = requiredText(formData, "password");

  if (!name || !email || !password) return { error: "Complete all fields to create your account." };
  if (password.length < 8) return { error: "Use a password with at least 8 characters." };
  if (!await isActiveMemberEmail(email)) {
    return { error: "This email address is not listed on the active council roster." };
  }

  const { error } = await auth.signUp.email({ name, email: email.toLowerCase(), password });
  if (error) return { error: error.message || "Unable to create your account." };
  redirect("/");
}
