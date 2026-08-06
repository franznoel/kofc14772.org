export default function PaymentsLoading() {
  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <div className="h-[85px] animate-pulse bg-slate-950" />
      <section className="mx-auto max-w-7xl px-6 py-10" aria-label="Loading payments">
        <div className="h-4 w-44 animate-pulse rounded bg-stone-200" />
        <div className="mt-8 h-10 w-56 animate-pulse rounded bg-stone-200" />
        <div className="mt-3 h-5 w-full max-w-2xl animate-pulse rounded bg-stone-200" />
        <div className="mt-8 h-56 animate-pulse rounded-2xl border border-stone-200 bg-white" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[0, 1, 2, 3, 4].map((item) => <div className="h-24 animate-pulse rounded-xl border border-stone-200 bg-white" key={item} />)}</div>
        <div className="mt-8 h-80 animate-pulse rounded-2xl border border-stone-200 bg-white" />
        <span className="sr-only">Loading payments…</span>
      </section>
    </main>
  );
}
