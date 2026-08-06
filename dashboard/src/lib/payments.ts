import "server-only";

export type PaymentType = "donation" | "event";
export type PaymentStatus = "succeeded" | "pending" | "refunded" | "disputed";
export type StripeConnectionStatus = "in_review" | "enabled" | "restricted";
export type CapabilityStatus = "active" | "pending" | "inactive";

export type CouncilPayment = {
  id: string;
  createdAt: string;
  payerName: string;
  payerEmail: string;
  type: PaymentType;
  description: string;
  grossAmount: number;
  stripeFee: number;
  platformFee: number;
  netAmount: number;
  status: PaymentStatus;
  receiptUrl: string | null;
};

export type PaymentsSummary = {
  totalGross: number;
  netToCouncil: number;
  platformFees: number;
  refundsAndDisputes: number;
  payout: {
    label: "Last payout" | "Next payout";
    amount: number;
    date: string;
  } | null;
};

export type PaymentsDashboardData = {
  connection: {
    accountName: string;
    accountId: string | null;
    status: StripeConnectionStatus;
    capabilities: {
      cardPayments: CapabilityStatus;
      transfers: CapabilityStatus;
      payouts: CapabilityStatus;
    };
    expressLoginUrl: string | null;
  };
  payments: CouncilPayment[];
  summary: PaymentsSummary;
  source: "adapter";
};

export function applicationFeeFor(type: PaymentType, status: PaymentStatus): number {
  if (status !== "succeeded") return 0;
  return type === "donation" ? 100 : 150;
}

export async function getPaymentsDashboardData(): Promise<PaymentsDashboardData> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const accountId = process.env.STRIPE_CONNECTED_ACCOUNT_ID ?? null;

  // This adapter intentionally returns no fabricated transactions. Replace this
  // section with server-side Stripe SDK calls when the Stripe integration lands.
  const payments: CouncilPayment[] = [];
  const isConfigured = Boolean(secretKey && accountId);

  return {
    connection: {
      accountName: "Knights of Columbus 14772",
      accountId,
      status: isConfigured ? "in_review" : "restricted",
      capabilities: {
        cardPayments: isConfigured ? "pending" : "inactive",
        transfers: isConfigured ? "pending" : "inactive",
        payouts: isConfigured ? "pending" : "inactive",
      },
      expressLoginUrl: null,
    },
    payments,
    summary: summarizePayments(payments, null),
    source: "adapter",
  };
}

export function getUnavailablePaymentsDashboardData(): PaymentsDashboardData {
  return {
    connection: {
      accountName: "Knights of Columbus 14772",
      accountId: process.env.STRIPE_CONNECTED_ACCOUNT_ID ?? null,
      status: "restricted",
      capabilities: { cardPayments: "inactive", transfers: "inactive", payouts: "inactive" },
      expressLoginUrl: null,
    },
    payments: [],
    summary: summarizePayments([], null),
    source: "adapter",
  };
}

function summarizePayments(
  payments: CouncilPayment[],
  payout: PaymentsSummary["payout"],
): PaymentsSummary {
  return {
    totalGross: payments.reduce((sum, payment) => sum + payment.grossAmount, 0),
    netToCouncil: payments.reduce((sum, payment) => sum + payment.netAmount, 0),
    platformFees: payments.reduce((sum, payment) => sum + payment.platformFee, 0),
    refundsAndDisputes: payments.filter((payment) => payment.status === "refunded" || payment.status === "disputed").length,
    payout,
  };
}
