import Link from "next/link";
import { UserMenu } from "@/components/user-menu";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function PaymentSettingsPage() {
  const { data: session } = await auth.getSession();

  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">Knights of Columbus</p>
            <h1 className="mt-1 text-xl font-semibold">St. Genevieve Council #14772</h1>
          </div>
          {session?.user ? (
            <UserMenu name={session.user.name} email={session.user.email} />
          ) : (
            <Link className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-500 hover:text-white" href="/auth/sign-in">Sign in</Link>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <nav className="mb-8 flex items-center gap-2 text-sm">
          <Link className="font-medium text-slate-500 transition hover:text-amber-700" href="/">Dashboard</Link>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-slate-500">Settings</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900">Payments</span>
        </nav>

        <p className="text-sm font-semibold text-amber-700">Settings</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Payment settings</h2>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">Manage the council&apos;s Stripe connection and payment processing setup.</p>

        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-xl text-amber-800" aria-hidden="true">$</div>
          <h3 className="mt-5 text-xl font-semibold">Stripe account setup</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">If Stripe sent you back here because your onboarding link expired or was already used, start the connection again from this page once Stripe onboarding is enabled.</p>
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">Stripe onboarding controls will appear here when the Stripe account integration is connected.</p>
        </div>
      </section>
    </main>
  );
}
