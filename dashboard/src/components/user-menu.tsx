import { signOutAction } from "@/app/auth/actions";

export function UserMenu({ name, email }: { name?: string; email?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-white">{name || "Council member"}</p>
        {email ? <p className="text-xs text-slate-400">{email}</p> : null}
      </div>
      <form action={signOutAction}>
        <button className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-500 hover:text-white" type="submit">
          Sign out
        </button>
      </form>
    </div>
  );
}
