import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const membershipEventTypes = new Set<Stripe.Event.Type>([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
]);

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const connectedAccountId = process.env.STRIPE_CONNECTED_ACCOUNT_ID;

  if (!webhookSecret || !connectedAccountId) {
    return Response.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return Response.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  if (event.account !== connectedAccountId || !membershipEventTypes.has(event.type)) {
    return Response.json({ received: true, ignored: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.metadata?.payment_type !== "membership_dues") {
    return Response.json({ received: true, ignored: true });
  }

  console.info("Stripe membership webhook received", {
    account: event.account,
    checkoutSessionId: session.id,
    eventId: event.id,
    livemode: event.livemode,
    paymentStatus: session.payment_status,
    type: event.type,
  });

  return Response.json({ received: true });
}
