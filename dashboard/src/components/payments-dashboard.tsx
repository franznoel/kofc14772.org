"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  CapabilityStatus,
  CouncilPayment,
  PaymentStatus,
  PaymentType,
  PaymentsDashboardData,
  StripeConnectionStatus,
} from "@/lib/payments";

type PaymentTypeFilter = "all" | PaymentType;
type PaymentStatusFilter = "all" | PaymentStatus;

export function PaymentsDashboard({ data, error }: { data: PaymentsDashboardData; error?: string }) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [type, setType] = useState<PaymentTypeFilter>("all");
  const [status, setStatus] = useState<PaymentStatusFilter>("all");

  const filteredPayments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return data.payments.filter((payment) => {
      const matchesQuery = !normalizedQuery || [payment.payerName, payment.payerEmail, payment.description, payment.id]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
      const paymentDate = payment.createdAt.slice(0, 10);
      return matchesQuery
        && (!dateFrom || paymentDate >= dateFrom)
        && (!dateTo || paymentDate <= dateTo)
        && (type === "all" || payment.type === type)
        && (status === "all" || payment.status === status);
    });
  }, [data.payments, dateFrom, dateTo, query, status, type]);

  function refreshStatus() {
    startRefresh(() => router.refresh());
  }

  return (
    <>
      <ConnectionCard connection={data.connection} isRefreshing={isRefreshing} onRefresh={refreshStatus} />
      <SummaryMetrics summary={data.summary} />

      <section className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm" aria-labelledby="payment-activity-title">
        <div className="border-b border-stone-200 px-5 py-5 sm:px-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h3 className="text-lg font-semibold text-slate-950" id="payment-activity-title">Payment activity</h3>
              <p className="mt-1 text-sm text-slate-500">Donations and event payments processed for the council.</p>
            </div>
            <p className="text-sm font-medium text-slate-500">{filteredPayments.length} {filteredPayments.length === 1 ? "payment" : "payments"}</p>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(240px,1.5fr)_repeat(4,minmax(135px,0.7fr))]">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Search<input className={inputClass} onChange={(event) => setQuery(event.target.value)} placeholder="Payer, email, event, or payment ID" type="search" value={query} /></label>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">From<input className={inputClass} max={dateTo || undefined} onChange={(event) => setDateFrom(event.target.value)} type="date" value={dateFrom} /></label>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">To<input className={inputClass} min={dateFrom || undefined} onChange={(event) => setDateTo(event.target.value)} type="date" value={dateTo} /></label>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Type<select className={inputClass} onChange={(event) => setType(event.target.value as PaymentTypeFilter)} value={type}><option value="all">All</option><option value="donation">Donations</option><option value="event">Events</option></select></label>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status<select className={inputClass} onChange={(event) => setStatus(event.target.value as PaymentStatusFilter)} value={status}><option value="all">All</option><option value="succeeded">Succeeded</option><option value="pending">Pending</option><option value="refunded">Refunded</option><option value="disputed">Disputed</option></select></label>
          </div>
        </div>

        {error ? (
          <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-5 text-red-900 sm:m-6" role="alert"><h4 className="font-semibold">Payments could not be loaded</h4><p className="mt-2 text-sm">{error}</p><button className="mt-4 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-red-100" onClick={refreshStatus} type="button">Try again</button></div>
        ) : isRefreshing ? (
          <LoadingRows />
        ) : filteredPayments.length === 0 ? (
          <div className="px-6 py-16 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-xl text-slate-500" aria-hidden="true">$</div><p className="mt-4 font-semibold text-slate-800">{data.payments.length === 0 ? "No payments have been recorded yet." : "No payments match these filters."}</p><p className="mt-2 text-sm text-slate-500">New Stripe activity will appear here when it becomes available.</p></div>
        ) : (
          <PaymentsTable payments={filteredPayments} />
        )}
      </section>
    </>
  );
}

const inputClass = "mt-1.5 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-slate-900 outline-none transition focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-600/20";

function ConnectionCard({ connection, isRefreshing, onRefresh }: { connection: PaymentsDashboardData["connection"]; isRefreshing: boolean; onRefresh: () => void }) {
  return <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-7" aria-labelledby="stripe-connection-title"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start"><div><div className="flex flex-wrap items-center gap-3"><h3 className="text-lg font-semibold" id="stripe-connection-title">Stripe connection</h3><ConnectionBadge status={connection.status} /></div><p className="mt-3 text-xl font-semibold text-slate-950">{connection.accountName}</p><p className="mt-1 font-mono text-sm text-slate-500">{maskAccountId(connection.accountId)}</p></div><div className="flex flex-wrap gap-3">{connection.expressLoginUrl ? <a className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-stone-50" href={connection.expressLoginUrl} rel="noopener" target="_blank">Open Stripe account ↗</a> : null}<button className="rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-60" disabled={isRefreshing} onClick={onRefresh} type="button">{isRefreshing ? "Refreshing…" : "Refresh status"}</button></div></div><div className="mt-6 grid gap-3 border-t border-stone-200 pt-5 sm:grid-cols-3"><Capability label="Card payments" status={connection.capabilities.cardPayments} /><Capability label="Transfers" status={connection.capabilities.transfers} /><Capability label="Payouts" status={connection.capabilities.payouts} /></div>{connection.status !== "enabled" ? <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">{connection.status === "restricted" ? "Stripe configuration is incomplete. Confirm the server environment variables and connected account." : "Stripe is reviewing the connected account. Capabilities will update when onboarding requirements are complete."}</p> : null}</section>;
}

function ConnectionBadge({ status }: { status: StripeConnectionStatus }) {
  const styles = status === "enabled" ? "bg-emerald-100 text-emerald-800" : status === "in_review" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800";
  const label = status === "enabled" ? "Enabled" : status === "in_review" ? "In review" : "Restricted";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>{label}</span>;
}

function Capability({ label, status }: { label: string; status: CapabilityStatus }) {
  const dot = status === "active" ? "bg-emerald-500" : status === "pending" ? "bg-amber-500" : "bg-slate-300";
  return <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3"><span className="text-sm font-medium text-slate-700">{label}</span><span className="flex items-center gap-2 text-xs font-semibold capitalize text-slate-500"><span className={`h-2 w-2 rounded-full ${dot}`} />{status}</span></div>;
}

function SummaryMetrics({ summary }: { summary: PaymentsDashboardData["summary"] }) {
  const metrics = [
    ["Total gross volume", formatMoney(summary.totalGross)],
    ["Net to council", formatMoney(summary.netToCouncil)],
    ["Platform fees", formatMoney(summary.platformFees)],
    ["Refunds / disputes", String(summary.refundsAndDisputes)],
    [summary.payout?.label ?? "Payout", summary.payout ? `${formatMoney(summary.payout.amount)} · ${formatShortDate(summary.payout.date)}` : "Not available"],
  ];
  return <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Payment summary">{metrics.map(([label, value]) => <article className="rounded-xl border border-stone-200 bg-white px-4 py-4 shadow-sm" key={label}><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-xl font-bold text-slate-950">{value}</p></article>)}</section>;
}

function PaymentsTable({ payments }: { payments: CouncilPayment[] }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[1380px] text-left text-sm"><thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className={thClass}>Date</th><th className={thClass}>Payer</th><th className={thClass}>Type</th><th className={thClass}>Description / Event</th><th className={`${thClass} text-right`}>Gross</th><th className={`${thClass} text-right`}>Stripe fees</th><th className={`${thClass} text-right`}>Platform fee</th><th className={`${thClass} text-right`}>Net to council</th><th className={thClass}>Status</th><th className={thClass}>Receipt / Payment ID</th></tr></thead><tbody className="divide-y divide-stone-100">{payments.map((payment) => <tr className="hover:bg-stone-50" key={payment.id}><td className={tdClass}><time dateTime={payment.createdAt}>{formatShortDate(payment.createdAt)}</time></td><td className={tdClass}><p className="font-semibold text-slate-900">{payment.payerName}</p><p className="mt-1 text-xs text-slate-500">{payment.payerEmail}</p></td><td className={`${tdClass} capitalize`}>{payment.type}</td><td className={`${tdClass} max-w-64`}>{payment.description}</td><td className={`${tdClass} text-right font-medium`}>{formatMoney(payment.grossAmount)}</td><td className={`${tdClass} text-right text-slate-500`}>−{formatMoney(payment.stripeFee)}</td><td className={`${tdClass} text-right text-slate-500`}>−{formatMoney(payment.platformFee)}</td><td className={`${tdClass} text-right font-semibold text-slate-900`}>{formatMoney(payment.netAmount)}</td><td className={tdClass}><PaymentStatusBadge status={payment.status} /></td><td className={tdClass}>{payment.receiptUrl ? <a className="font-mono text-xs font-semibold text-amber-700 hover:underline" href={payment.receiptUrl} rel="noopener" target="_blank">{shortPaymentId(payment.id)} ↗</a> : <span className="font-mono text-xs text-slate-500">{shortPaymentId(payment.id)}</span>}</td></tr>)}</tbody></table></div>;
}

const thClass = "px-4 py-3 font-semibold";
const tdClass = "whitespace-nowrap px-4 py-4 text-slate-600";

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const styles: Record<PaymentStatus, string> = { succeeded: "bg-emerald-100 text-emerald-800", pending: "bg-amber-100 text-amber-800", refunded: "bg-slate-200 text-slate-700", disputed: "bg-red-100 text-red-800" };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[status]}`}>{status}</span>;
}

function LoadingRows() {
  return <div aria-label="Loading payments" aria-live="polite" className="space-y-3 px-6 py-8">{[0, 1, 2].map((row) => <div className="h-12 animate-pulse rounded-lg bg-stone-100" key={row} />)}<span className="sr-only">Loading payments…</span></div>;
}

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function maskAccountId(accountId: string | null): string {
  if (!accountId) return "Account ID unavailable";
  return `acct_••••${accountId.slice(-4)}`;
}

function shortPaymentId(id: string): string {
  return id.length > 18 ? `${id.slice(0, 10)}…${id.slice(-4)}` : id;
}
