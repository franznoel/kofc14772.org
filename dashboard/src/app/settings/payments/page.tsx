import Link from "next/link";
import { redirect } from "next/navigation";
import { PaymentsDashboard } from "@/components/payments-dashboard";
import { UserMenu } from "@/components/user-menu";
import { auth } from "@/lib/auth/server";
import { isUserAdministrator } from "@/lib/user-administration";
import { getPaymentsDashboardData, getUnavailablePaymentsDashboardData } from "@/lib/payments";

export const dynamic = "force-dynamic";

export default async function PaymentSettingsPage() {
  if (!await isUserAdministrator()) redirect("/");

  const [{ data: session }, result] = await Promise.all([
    auth.getSession(),
    getPaymentsDashboardData().then(
      (data) => ({ data, error: undefined }),
      () => ({ data: getUnavailablePaymentsDashboardData(), error: "Check the server-side Stripe configuration and try refreshing the status." }),
    ),
  ]);

  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">Knights of Columbus</p>
            <h1 className="mt-1 text-xl font-semibold">St. Genevieve Council #14772</h1>
          </div>
          <UserMenu name={session?.user?.name} email={session?.user?.email} />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <nav className="mb-8 flex items-center gap-2 text-sm">
          <Link className="font-medium text-slate-500 transition hover:text-amber-700" href="/">Dashboard</Link>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-slate-500">Settings</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900">Payments</span>
        </nav>

        <p className="text-sm font-semibold text-amber-700">Financial operations</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Payments</h2>
        <p className="mt-3 max-w-3xl leading-7 text-slate-600">Review council donations, event payments, fees, refunds, disputes, and Stripe payout readiness.</p>

        <PaymentsDashboard data={result.data} error={result.error} />
      </section>
    </main>
  );
}
