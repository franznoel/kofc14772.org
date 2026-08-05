import { UserMenu } from "@/components/user-menu";
import { auth } from "@/lib/auth/server";

const sections = [
  { title: "Announcements", description: "Draft and publish updates for the council website.", count: "—" },
  { title: "Events", description: "Manage meetings, services, and community events.", count: "—" },
  { title: "Members", description: "Maintain member records and administrative access.", count: "—" },
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: session } = await auth.getSession();

  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">Council 14772</p>
            <h1 className="mt-1 text-xl font-semibold">St. Genevieve Knights</h1>
          </div>
          <UserMenu name={session?.user?.name} email={session?.user?.email} />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm font-semibold text-amber-700">Administration</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome{session?.user?.name ? `, ${session.user.name}` : ""}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          The application foundation is ready. Authentication and live council data will be connected next.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold">{section.title}</h3>
                <span className="text-2xl font-semibold text-amber-700">{section.count}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{section.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-amber-700/40 bg-amber-50 p-6">
          <h3 className="font-semibold text-amber-950">Next milestone</h3>
          <p className="mt-2 text-sm leading-6 text-amber-900/80">
            Provision Neon, configure Neon Auth, and apply the first Knex migration before enabling administrative actions.
          </p>
        </div>
      </section>
    </main>
  );
}
