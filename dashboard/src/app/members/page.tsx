import Link from "next/link";
import { MembersTable } from "@/components/members-table";
import { UserMenu } from "@/components/user-menu";
import { auth } from "@/lib/auth/server";
import { listMembers, type Member } from "@/lib/members";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const [{ data: session }, result] = await Promise.all([
    auth.getSession(),
    listMembers().then(
      (members) => ({ members, unavailable: false }),
      () => ({ members: [] as Member[], unavailable: true }),
    ),
  ]);

  const reviewCount = result.members.filter((member) => member.needsReview).length;

  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">Council 14772</p>
            <h1 className="mt-1 text-xl font-semibold">St. Genevieve Knights</h1>
          </div>
          <UserMenu name={session?.user?.name} email={session?.user?.email} />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <nav className="mb-8 flex items-center gap-2 text-sm">
          <Link className="font-medium text-slate-500 transition hover:text-amber-700" href="/">Dashboard</Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900">Members</span>
        </nav>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-amber-700">Directory</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Council members</h2>
            <p className="mt-3 text-slate-600">Contact information transcribed from the council roster.</p>
          </div>
          {!result.unavailable ? (
            <div className="flex gap-3">
              <Stat label="Members" value={result.members.length} />
              <Stat label="Review" value={reviewCount} highlight={reviewCount > 0} />
            </div>
          ) : null}
        </div>

        {result.unavailable ? (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
            <h3 className="font-semibold">Member directory is ready to initialize</h3>
            <p className="mt-2 text-sm leading-6">Connect the real Neon database and run <code className="rounded bg-amber-100 px-1.5 py-0.5">npm run db:migrate</code> from the dashboard folder.</p>
          </div>
        ) : (
          <MembersTable members={result.members} />
        )}
      </section>
    </main>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return <div className={`min-w-24 rounded-xl border px-4 py-3 ${highlight ? "border-amber-200 bg-amber-50" : "border-stone-200 bg-white"}`}><p className="text-2xl font-bold">{value}</p><p className="text-xs font-medium text-slate-500">{label}</p></div>;
}
