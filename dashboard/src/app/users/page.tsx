import Link from "next/link";
import { AddUserForm } from "@/components/add-user-form";
import { UserMenu } from "@/components/user-menu";
import { UsersTable } from "@/components/users-table";
import { auth } from "@/lib/auth/server";
import { listUsers, type DashboardUser } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const [{ data: session }, result] = await Promise.all([
    auth.getSession(),
    listUsers().then(
      (users) => ({ users, unavailable: false }),
      () => ({ users: [] as DashboardUser[], unavailable: true }),
    ),
  ]);

  const verifiedCount = result.users.filter((user) => user.emailVerified).length;
  const bannedCount = result.users.filter((user) => user.banned).length;

  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">Council 14772</p><h1 className="mt-1 text-xl font-semibold">St. Genevieve Knights</h1></div>
          <UserMenu name={session?.user?.name} email={session?.user?.email} />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <nav className="mb-8 flex items-center gap-2 text-sm"><Link className="font-medium text-slate-500 transition hover:text-amber-700" href="/">Dashboard</Link><span className="text-slate-300">/</span><span className="font-semibold text-slate-900">Users</span></nav>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-sm font-semibold text-amber-700">Access</p><h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Dashboard users</h2><p className="mt-3 text-slate-600">Accounts registered through Neon Auth.</p></div>
          {!result.unavailable ? <div className="flex flex-col items-start gap-4 sm:items-end"><AddUserForm /><div className="flex flex-wrap gap-3"><Stat label="Users" value={result.users.length} /><Stat label="Verified" value={verifiedCount} /><Stat label="Banned" value={bannedCount} highlight={bannedCount > 0} /></div></div> : null}
        </div>
        {result.unavailable ? <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950"><h3 className="font-semibold">User directory is unavailable</h3><p className="mt-2 text-sm leading-6">Check the Neon database connection and confirm Neon Auth has created the <code className="rounded bg-amber-100 px-1.5 py-0.5">neon_auth.user</code> table.</p></div> : <UsersTable currentUserId={session?.user?.id} users={result.users} />}
      </section>
    </main>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return <div className={`min-w-24 rounded-xl border px-4 py-3 ${highlight ? "border-red-200 bg-red-50" : "border-stone-200 bg-white"}`}><p className="text-2xl font-bold">{value}</p><p className="text-xs font-medium text-slate-500">{label}</p></div>;
}
