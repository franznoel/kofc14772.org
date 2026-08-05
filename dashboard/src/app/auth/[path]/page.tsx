import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthForm } from "@/components/auth-form";

export default async function AuthPage({ params }: PageProps<"/auth/[path]">) {
  const { path } = await params;
  if (path !== "sign-in" && path !== "sign-up") notFound();

  return (
    <main className="grid min-h-screen bg-stone-100 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <Image
            alt="Knights of Columbus St. Genevieve Council 14772 logo"
            className="h-20 w-20"
            height={80}
            priority
            src="/knights-of-columbus-logo.png"
            width={80}
          />
          <div>
            <h1 className="mt-2 text-2xl font-semibold">Knights of Columbus</h1>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-400">St. Genevieve Council #14772</p>
          </div>
        </div>
        <div className="relative max-w-xl">
          <p className="text-4xl font-semibold leading-tight tracking-tight">Service, fraternity, and faith—organized in one secure place.</p>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">Sign in to manage council announcements, events, and member information.</p>
        </div>
        <p className="relative text-sm text-slate-400">Knights of Columbus · St. Genevieve Council</p>
      </section>

      <section className="flex min-h-screen flex-col px-6 py-8 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="flex items-center gap-3 lg:hidden">
            <Image
              alt="Knights of Columbus St. Genevieve Council 14772 logo"
              className="h-12 w-12"
              height={48}
              priority
              src="/knights-of-columbus-logo.png"
              width={48}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Council 14772</p>
              <p className="mt-1 font-semibold text-slate-950">St. Genevieve Knights</p>
            </div>
          </div>
          <Link className="text-sm font-medium text-slate-600 transition hover:text-amber-700" href="https://stgenknights.com">Back to website</Link>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 items-center py-12">
          <AuthForm mode={path} />
        </div>
      </section>
    </main>
  );
}
