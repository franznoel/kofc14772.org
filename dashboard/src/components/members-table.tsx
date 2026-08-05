"use client";

import { useMemo, useState } from "react";
import type { Member } from "@/lib/members";

type SortKey = "fullName" | "phone" | "email" | "status";
type SortDirection = "ascending" | "descending";

export function MembersTable({ members }: { members: Member[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("fullName");
  const [direction, setDirection] = useState<SortDirection>("ascending");

  const sortedMembers = useMemo(() => {
    const multiplier = direction === "ascending" ? 1 : -1;
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const phoneQuery = /^[\d\s()+.-]+$/.test(normalizedQuery)
      ? normalizedQuery.replace(/\D/g, "")
      : "";

    const filteredMembers = normalizedQuery
      ? members.filter((member) => {
          const status = member.needsReview ? "needs review" : "active";
          const searchableValues = [
            String(member.rosterNumber),
            `#${member.rosterNumber}`,
            `roster ${member.rosterNumber}`,
            member.fullName,
            member.email ?? "",
            member.phone ?? "",
            status,
          ];

          return searchableValues.some((value) => value.toLocaleLowerCase().includes(normalizedQuery))
            || Boolean(phoneQuery && member.phone?.replace(/\D/g, "").includes(phoneQuery));
        })
      : members;

    return [...filteredMembers].sort((left, right) => {
      const leftValue = comparableValue(left, sortKey);
      const rightValue = comparableValue(right, sortKey);

      if (leftValue === null && rightValue === null) return left.rosterNumber - right.rosterNumber;
      if (leftValue === null) return 1;
      if (rightValue === null) return -1;

      const comparison = leftValue.localeCompare(rightValue, undefined, {
        numeric: true,
        sensitivity: "base",
      });

      return comparison === 0
        ? left.rosterNumber - right.rosterNumber
        : comparison * multiplier;
    });
  }, [direction, members, query, sortKey]);

  function changeSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setDirection((current) => current === "ascending" ? "descending" : "ascending");
      return;
    }

    setSortKey(nextKey);
    setDirection("ascending");
  }

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-stone-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">⌕</span>
          <label className="sr-only" htmlFor="member-search">Search members</label>
          <input
            autoComplete="off"
            className="w-full rounded-xl border border-stone-300 bg-stone-50 py-2.5 pl-9 pr-10 text-sm text-slate-950 transition placeholder:text-slate-400 focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-600/20"
            id="member-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search members…"
            type="search"
            value={query}
          />
          {query ? (
            <button
              aria-label="Clear member search"
              className="absolute inset-y-0 right-2 px-2 text-slate-400 transition hover:text-slate-700"
              onClick={() => setQuery("")}
              type="button"
            >
              ×
            </button>
          ) : null}
        </div>
        <p aria-live="polite" className="shrink-0 text-sm text-slate-500">
          {sortedMembers.length} {sortedMembers.length === 1 ? "member" : "members"}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <SortableHeader activeKey={sortKey} direction={direction} label="Member" onSort={changeSort} sortKey="fullName" />
              <SortableHeader activeKey={sortKey} direction={direction} label="Phone" onSort={changeSort} sortKey="phone" />
              <SortableHeader activeKey={sortKey} direction={direction} label="Email" onSort={changeSort} sortKey="email" />
              <SortableHeader activeKey={sortKey} direction={direction} label="Status" onSort={changeSort} sortKey="status" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {sortedMembers.length === 0 ? (
              <tr>
                <td className="px-6 py-12 text-center text-sm text-slate-500" colSpan={4}>
                  {query ? "No members match your search." : "No members have been added yet."}
                </td>
              </tr>
            ) : null}
            {sortedMembers.map((member) => (
              <tr className="transition hover:bg-stone-50" key={member.id}>
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-900">{member.fullName}</p>
                  <p className="mt-1 text-xs text-slate-400">Roster #{member.rosterNumber}</p>
                </td>
                <td className="px-6 py-4 text-sm">
                  {member.phone ? <a className="text-slate-700 hover:text-amber-700" href={`tel:${member.phone.replace(/[^\d+]/g, "")}`}>{member.phone}</a> : <Missing />}
                </td>
                <td className="px-6 py-4 text-sm">
                  {member.email ? <a className="text-slate-700 hover:text-amber-700" href={`mailto:${member.email}`}>{member.email}</a> : <Missing />}
                </td>
                <td className="px-6 py-4">
                  {member.needsReview ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Needs review</span> : <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Active</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortableHeader({ activeKey, direction, label, onSort, sortKey }: {
  activeKey: SortKey;
  direction: SortDirection;
  label: string;
  onSort: (key: SortKey) => void;
  sortKey: SortKey;
}) {
  const isActive = activeKey === sortKey;

  return (
    <th aria-sort={isActive ? direction : "none"} className="px-6 py-4 font-semibold">
      <button className="group inline-flex items-center gap-2 transition hover:text-amber-700" onClick={() => onSort(sortKey)} type="button">
        {label}
        <span aria-hidden="true" className={isActive ? "text-amber-700" : "text-slate-300 group-hover:text-amber-500"}>
          {isActive ? direction === "ascending" ? "↑" : "↓" : "↕"}
        </span>
      </button>
    </th>
  );
}

function comparableValue(member: Member, sortKey: SortKey): string | null {
  if (sortKey === "status") {
    return member.needsReview ? "Needs review" : "Active";
  }

  const value = member[sortKey];
  if (!value) return null;
  return sortKey === "phone" ? value.replace(/\D/g, "") : value;
}

function Missing() {
  return <span className="text-slate-400">Not provided</span>;
}
