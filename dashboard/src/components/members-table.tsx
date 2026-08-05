"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Member } from "@/lib/members";

type SortKey = "fullName" | "phone" | "email" | "status";
type SortDirection = "ascending" | "descending";
type EditableField = "fullName" | "rosterNumber" | "email" | "phone";

export function MembersTable({ members }: { members: Member[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("fullName");
  const [direction, setDirection] = useState<SortDirection>("ascending");
  const [editing, setEditing] = useState<{ memberId: string; field: EditableField } | null>(null);
  const [draft, setDraft] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  function startEditing(member: Member, field: EditableField) {
    setEditing({ memberId: member.id, field });
    setDraft(String(member[field] ?? ""));
    setActionError(null);
  }

  function saveField(member: Member, field: EditableField) {
    const value = draft.trim();
    if (field === "fullName" && !value) {
      setActionError("Enter a member name.");
      return;
    }
    if (field === "rosterNumber" && (!/^\d+$/.test(value) || Number(value) < 1)) {
      setActionError("Roster number must be a positive whole number.");
      return;
    }

    updateMember(member.id, { [field]: field === "rosterNumber" ? Number(value) : value }, () => setEditing(null));
  }

  function updateMember(memberId: string, changes: Record<string, unknown>, onSuccess?: () => void) {
    setUpdatingId(memberId);
    setActionError(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/members/${encodeURIComponent(memberId)}`, {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(changes),
        });
        const result = await response.json() as { error?: string };
        if (!response.ok) throw new Error(result.error || "Unable to update this member.");
        onSuccess?.();
        router.refresh();
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "Unable to update this member.");
        router.refresh();
      } finally {
        setUpdatingId(null);
      }
    });
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
        <div className="text-right">
          <p aria-live="polite" className="shrink-0 text-sm text-slate-500">{sortedMembers.length} {sortedMembers.length === 1 ? "member" : "members"}</p>
          {actionError ? <p className="mt-1 text-sm text-red-700" role="alert">{actionError}</p> : null}
        </div>
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
                  {editing?.memberId === member.id && editing.field === "fullName" ? (
                    <InlineEditor draft={draft} inputMode="text" label={`Name for ${member.fullName}`} onCancel={() => setEditing(null)} onChange={setDraft} onSave={() => saveField(member, "fullName")} pending={isPending && updatingId === member.id} />
                  ) : (
                    <button aria-label={`Edit name for ${member.fullName}`} className="block text-left font-semibold text-slate-900 decoration-amber-500 underline-offset-4 hover:text-amber-700 hover:underline" onClick={() => startEditing(member, "fullName")} type="button">{member.fullName}</button>
                  )}
                  <div className="mt-1">
                    {editing?.memberId === member.id && editing.field === "rosterNumber" ? (
                      <InlineEditor draft={draft} inputMode="numeric" label={`Roster number for ${member.fullName}`} onCancel={() => setEditing(null)} onChange={setDraft} onSave={() => saveField(member, "rosterNumber")} pending={isPending && updatingId === member.id} />
                    ) : (
                      <button aria-label={`Edit roster number for ${member.fullName}`} className="text-xs text-slate-400 decoration-amber-500 underline-offset-2 hover:text-amber-700 hover:underline" onClick={() => startEditing(member, "rosterNumber")} type="button">Roster #{member.rosterNumber}</button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {editing?.memberId === member.id && editing.field === "phone" ? (
                    <InlineEditor draft={draft} inputMode="tel" label={`Phone for ${member.fullName}`} onCancel={() => setEditing(null)} onChange={setDraft} onSave={() => saveField(member, "phone")} pending={isPending && updatingId === member.id} />
                  ) : (
                    <button aria-label={`Edit phone for ${member.fullName}`} className="text-left text-slate-700 decoration-amber-500 underline-offset-4 hover:text-amber-700 hover:underline" onClick={() => startEditing(member, "phone")} type="button">{member.phone || "Not provided"}</button>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  {editing?.memberId === member.id && editing.field === "email" ? (
                    <InlineEditor draft={draft} inputMode="email" label={`Email for ${member.fullName}`} onCancel={() => setEditing(null)} onChange={setDraft} onSave={() => saveField(member, "email")} pending={isPending && updatingId === member.id} />
                  ) : (
                    <button aria-label={`Edit email for ${member.fullName}`} className="text-left text-slate-700 decoration-amber-500 underline-offset-4 hover:text-amber-700 hover:underline" onClick={() => startEditing(member, "email")} type="button">{member.email || "Not provided"}</button>
                  )}
                </td>
                <td className="px-6 py-4">
                  <select aria-label={`Status for ${member.fullName}`} className={`rounded-lg border px-2.5 py-1.5 text-sm font-medium ${member.needsReview ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`} disabled={isPending && updatingId === member.id} onChange={(event) => updateMember(member.id, { status: event.target.value })} value={member.needsReview ? "needs_review" : "active"}><option value="active">Active</option><option value="needs_review">Needs review</option></select>
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

function InlineEditor({ draft, inputMode, label, onCancel, onChange, onSave, pending }: {
  draft: string;
  inputMode: "text" | "numeric" | "email" | "tel";
  label: string;
  onCancel: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  pending: boolean;
}) {
  return (
    <form className="flex min-w-72 items-center gap-2" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
      <label className="sr-only" htmlFor={`edit-${label}`}>{label}</label>
      <input autoFocus className="min-w-0 flex-1 rounded-lg border border-amber-400 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none ring-2 ring-amber-500/20" disabled={pending} id={`edit-${label}`} inputMode={inputMode} onChange={(event) => onChange(event.target.value)} type={inputMode === "email" ? "email" : "text"} value={draft} />
      <button className="rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800 disabled:opacity-60" disabled={pending} type="submit">{pending ? "Saving…" : "Save"}</button>
      <button className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-stone-100" disabled={pending} onClick={onCancel} type="button">Cancel</button>
    </form>
  );
}
