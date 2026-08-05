import Link from "next/link";
import { UserMenu } from "@/components/user-menu";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage() {
  const { data: session } = await auth.getSession();

  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">Knights of Columbus</p>
            <h1 className="mt-1 text-xl font-semibold">St. Genevieve Council #14772</h1>
          </div>
          <UserMenu name={session?.user?.name} email={session?.user?.email} />
        </div>
      </header>

      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-16 text-center sm:py-24">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl font-semibold text-emerald-700" aria-hidden="true">✓</div>
        <p className="mt-7 text-sm font-semibold text-amber-700">Stripe onboarding</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Returned from Stripe</h2>
        <p className="mt-4 max-w-xl leading-7 text-slate-600">Your Stripe onboarding session has returned to the dashboard. Review Payment settings to confirm the account status or complete any remaining requirements.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800" href="/settings/payments">View payment settings</Link>
          <Link className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-50" href="/">Return to dashboard</Link>
        </div>
      </section>
    </main>
  );
}
