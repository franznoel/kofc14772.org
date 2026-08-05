"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DashboardUser } from "@/lib/users";

type SortKey = "name" | "email" | "role" | "status" | "createdAt";
type SortDirection = "ascending" | "descending";

export function UsersTable({ currentUserId, users }: { currentUserId?: string; users: DashboardUser[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [direction, setDirection] = useState<SortDirection>("descending");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [controlVersion, setControlVersion] = useState(0);
  const [isPending, startTransition] = useTransition();

  const sortedUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filteredUsers = normalizedQuery
      ? users.filter((user) => [
          user.name,
          user.email,
          user.role ?? "user",
          user.banned ? "banned" : "active",
          user.emailVerified ? "verified" : "unverified",
        ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery)))
      : users;

    const multiplier = direction === "ascending" ? 1 : -1;
    return [...filteredUsers].sort((left, right) => {
      const comparison = comparableValue(left, sortKey).localeCompare(
        comparableValue(right, sortKey),
        undefined,
        { numeric: true, sensitivity: "base" },
      );
      return comparison === 0
        ? left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
        : comparison * multiplier;
    });
  }, [direction, query, sortKey, users]);

  function changeSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setDirection((current) => current === "ascending" ? "descending" : "ascending");
      return;
    }

    setSortKey(nextKey);
    setDirection(nextKey === "createdAt" ? "descending" : "ascending");
  }

  function verify(userId: string) {
    setVerifyingId(userId);
    setActionError(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/users/${encodeURIComponent(userId)}/verify`, {
          method: "POST",
          credentials: "same-origin",
          headers: { "content-type": "application/json" },
          body: "{}",
        });
        const result = await response.json() as { error?: string };
        if (!response.ok) throw new Error(result.error || "Unable to verify this user.");
        router.refresh();
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "Unable to verify this user.");
      } finally {
        setVerifyingId(null);
      }
    });
  }

  function updateUser(userId: string, changes: { role?: string; status?: string }) {
    setUpdatingId(userId);
    setActionError(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(changes),
        });
        const result = await response.json() as { error?: string };
        if (!response.ok) throw new Error(result.error || "Unable to update this user.");
        router.refresh();
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "Unable to update this user.");
        setControlVersion((current) => current + 1);
        router.refresh();
      } finally {
        setUpdatingId(null);
      }
    });
  }

  function removeUser(user: DashboardUser) {
    if (!window.confirm(`Delete ${user.name}? This permanently removes their account and active sessions.`)) return;

    setUpdatingId(user.id);
    setActionError(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/users/${encodeURIComponent(user.id)}`, {
          method: "DELETE",
          credentials: "same-origin",
          headers: { "content-type": "application/json" },
          body: "{}",
        });
        const result = await response.json() as { error?: string };
        if (!response.ok) throw new Error(result.error || "Unable to delete this user.");
        router.refresh();
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "Unable to delete this user.");
      } finally {
        setUpdatingId(null);
      }
    });
  }

  function startEditingName(user: DashboardUser) {
    setEditingUserId(user.id);
    setNameDraft(user.name);
    setActionError(null);
  }

  function saveName(userId: string) {
    const name = nameDraft.trim();
    if (!name) {
      setActionError("Enter a user name.");
      return;
    }

    setUpdatingId(userId);
    setActionError(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name }),
        });
        const result = await response.json() as { error?: string };
        if (!response.ok) throw new Error(result.error || "Unable to update this name.");
        setEditingUserId(null);
        router.refresh();
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "Unable to update this name.");
      } finally {
        setUpdatingId(null);
      }
    });
  }

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-stone-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">⌕</span>
          <label className="sr-only" htmlFor="user-search">Search users</label>
          <input
            autoComplete="off"
            className="w-full rounded-xl border border-stone-300 bg-stone-50 py-2.5 pl-9 pr-10 text-sm text-slate-950 transition placeholder:text-slate-400 focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-600/20"
            id="user-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users…"
            type="search"
            value={query}
          />
          {query ? <button aria-label="Clear user search" className="absolute inset-y-0 right-2 px-2 text-slate-400 transition hover:text-slate-700" onClick={() => setQuery("")} type="button">×</button> : null}
        </div>
        <div className="text-right"><p aria-live="polite" className="shrink-0 text-sm text-slate-500">{sortedUsers.length} {sortedUsers.length === 1 ? "user" : "users"}</p>{actionError ? <p className="mt-1 text-sm text-red-700">{actionError}</p> : null}</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <SortableHeader activeKey={sortKey} direction={direction} label="User" onSort={changeSort} sortKey="name" />
              <SortableHeader activeKey={sortKey} direction={direction} label="Email" onSort={changeSort} sortKey="email" />
              <SortableHeader activeKey={sortKey} direction={direction} label="Role" onSort={changeSort} sortKey="role" />
              <SortableHeader activeKey={sortKey} direction={direction} label="Status" onSort={changeSort} sortKey="status" />
              <SortableHeader activeKey={sortKey} direction={direction} label="Joined" onSort={changeSort} sortKey="createdAt" />
              <th className="px-6 py-4 font-semibold"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {sortedUsers.length === 0 ? <tr><td className="px-6 py-12 text-center text-sm text-slate-500" colSpan={6}>{query ? "No users match your search." : "No users have signed up yet."}</td></tr> : null}
            {sortedUsers.map((user) => (
              <tr className="transition hover:bg-stone-50" key={user.id}>
                <td className="px-6 py-4">
                  {editingUserId === user.id ? (
                    <form className="flex min-w-64 items-center gap-2" onSubmit={(event) => { event.preventDefault(); saveName(user.id); }}>
                      <label className="sr-only" htmlFor={`user-name-${user.id}`}>Name for {user.name}</label>
                      <input autoFocus className="min-w-0 flex-1 rounded-lg border border-amber-400 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900 outline-none ring-2 ring-amber-500/20" disabled={isPending && updatingId === user.id} id={`user-name-${user.id}`} maxLength={120} onChange={(event) => setNameDraft(event.target.value)} required type="text" value={nameDraft} />
                      <button className="rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800 disabled:opacity-60" disabled={isPending && updatingId === user.id} type="submit">{updatingId === user.id ? "Saving…" : "Save"}</button>
                      <button className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-stone-100" disabled={isPending && updatingId === user.id} onClick={() => setEditingUserId(null)} type="button">Cancel</button>
                    </form>
                  ) : (
                    <button aria-label={`Edit name for ${user.name}`} className="text-left font-semibold text-slate-900 decoration-amber-500 underline-offset-4 hover:text-amber-700 hover:underline" onClick={() => startEditingName(user)} type="button">{user.name}</button>
                  )}
                  <p className={`mt-1 text-xs ${user.emailVerified ? "text-emerald-700" : "text-amber-700"}`}>{user.emailVerified ? "Email verified" : "Email unverified"}</p>
                </td>
                <td className="px-6 py-4 text-sm"><a className="text-slate-700 hover:text-amber-700" href={`mailto:${user.email}`}>{user.email}</a></td>
                <td className="px-6 py-4 text-sm"><select aria-label={`Role for ${user.name}`} className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm capitalize text-slate-700" disabled={isPending && updatingId === user.id} key={`role-${user.id}-${controlVersion}`} onChange={(event) => updateUser(user.id, { role: event.target.value })} value={user.role || "user"}><option value="user">User</option><option value="admin">Admin</option></select></td>
                <td className="px-6 py-4"><select aria-label={`Status for ${user.name}`} className={`rounded-lg border px-2.5 py-1.5 text-sm font-medium ${user.banned ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`} disabled={isPending && updatingId === user.id} key={`status-${user.id}-${controlVersion}`} onChange={(event) => updateUser(user.id, { status: event.target.value })} value={user.banned ? "banned" : "active"}><option value="active">Active</option><option value="banned">Banned</option></select></td>
                <td className="px-6 py-4 text-sm text-slate-600"><time dateTime={user.createdAt}>{formatDate(user.createdAt)}</time></td>
                <td className="px-6 py-4"><div className="flex items-center justify-end gap-2">{user.emailVerified ? <span className="text-xs font-medium text-slate-400">Verified</span> : <button className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:border-amber-500 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} onClick={() => verify(user.id)} type="button">{verifyingId === user.id ? "Verifying…" : "Verify"}</button>}<button className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40" disabled={isPending || user.id === currentUserId} onClick={() => removeUser(user)} title={user.id === currentUserId ? "You cannot delete your own account" : undefined} type="button">{updatingId === user.id ? "Saving…" : "Delete"}</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortableHeader({ activeKey, direction, label, onSort, sortKey }: { activeKey: SortKey; direction: SortDirection; label: string; onSort: (key: SortKey) => void; sortKey: SortKey }) {
  const isActive = activeKey === sortKey;
  return <th aria-sort={isActive ? direction : "none"} className="px-6 py-4 font-semibold"><button className="group inline-flex items-center gap-2 transition hover:text-amber-700" onClick={() => onSort(sortKey)} type="button">{label}<span aria-hidden="true" className={isActive ? "text-amber-700" : "text-slate-300 group-hover:text-amber-500"}>{isActive ? direction === "ascending" ? "↑" : "↓" : "↕"}</span></button></th>;
}

function comparableValue(user: DashboardUser, sortKey: SortKey): string {
  if (sortKey === "status") return user.banned ? "Banned" : "Active";
  if (sortKey === "role") return user.role || "User";
  return user[sortKey];
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}
