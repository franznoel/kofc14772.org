"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserMenu({ name, email }: { name?: string; email?: string }) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    setIsSigningOut(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });

      if (!response.ok) throw new Error("Sign out failed.");
      router.replace("/auth/sign-in");
      router.refresh();
    } catch {
      setError("Unable to sign out. Please try again.");
      setIsSigningOut(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-white">{name || "Council member"}</p>
        {email ? <p className="text-xs text-slate-400">{email}</p> : null}
        {error ? <p className="mt-1 text-xs text-red-300" role="alert">{error}</p> : null}
      </div>
      <button
        className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSigningOut}
        onClick={signOut}
        type="button"
      >
        {isSigningOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
