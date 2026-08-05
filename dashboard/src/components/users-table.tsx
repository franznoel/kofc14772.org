"use client";

import { useMemo, useState } from "react";
import type { DashboardUser } from "@/lib/users";

type SortKey = "name" | "email" | "role" | "status" | "createdAt";
type SortDirection = "ascending" | "descending";

export function UsersTable({ users }: { users: DashboardUser[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [direction, setDirection] = useState<SortDirection>("descending");

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
        <p aria-live="polite" className="shrink-0 text-sm text-slate-500">{sortedUsers.length} {sortedUsers.length === 1 ? "user" : "users"}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <SortableHeader activeKey={sortKey} direction={direction} label="User" onSort={changeSort} sortKey="name" />
              <SortableHeader activeKey={sortKey} direction={direction} label="Email" onSort={changeSort} sortKey="email" />
              <SortableHeader activeKey={sortKey} direction={direction} label="Role" onSort={changeSort} sortKey="role" />
              <SortableHeader activeKey={sortKey} direction={direction} label="Status" onSort={changeSort} sortKey="status" />
              <SortableHeader activeKey={sortKey} direction={direction} label="Joined" onSort={changeSort} sortKey="createdAt" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {sortedUsers.length === 0 ? <tr><td className="px-6 py-12 text-center text-sm text-slate-500" colSpan={5}>{query ? "No users match your search." : "No users have signed up yet."}</td></tr> : null}
            {sortedUsers.map((user) => (
              <tr className="transition hover:bg-stone-50" key={user.id}>
                <td className="px-6 py-4"><p className="font-semibold text-slate-900">{user.name}</p><p className={`mt-1 text-xs ${user.emailVerified ? "text-emerald-700" : "text-amber-700"}`}>{user.emailVerified ? "Email verified" : "Email unverified"}</p></td>
                <td className="px-6 py-4 text-sm"><a className="text-slate-700 hover:text-amber-700" href={`mailto:${user.email}`}>{user.email}</a></td>
                <td className="px-6 py-4 text-sm capitalize text-slate-700">{user.role || "User"}</td>
                <td className="px-6 py-4">{user.banned ? <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">Banned</span> : <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Active</span>}</td>
                <td className="px-6 py-4 text-sm text-slate-600"><time dateTime={user.createdAt}>{formatDate(user.createdAt)}</time></td>
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
