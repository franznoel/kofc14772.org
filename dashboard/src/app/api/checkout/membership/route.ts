import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const paymentMetadata = {
  council: "14772",
  payment_type: "membership_dues",
};

function getPublicSiteOrigin(): string | null {
  const configuredOrigin = process.env.PUBLIC_SITE_ORIGIN;
  if (!configuredOrigin) return null;

  try {
    const origin = new URL(configuredOrigin);
    if (origin.protocol !== "https:" || origin.username || origin.password) return null;
    return origin.origin;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const publicSiteOrigin = getPublicSiteOrigin();
  if (!publicSiteOrigin) {
    return Response.json({ error: "Membership checkout is not configured." }, { status: 503 });
  }

  if (request.headers.get("origin") !== publicSiteOrigin) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const connectedAccountId = process.env.STRIPE_CONNECTED_ACCOUNT_ID;
  const priceId = process.env.STRIPE_MEMBERSHIP_DUES_PRICE_ID;
  if (!connectedAccountId || !priceId) {
    return Response.redirect(`${publicSiteOrigin}/membership/?payment=unavailable`, 303);
  }

  try {
    const session = await getStripe().checkout.sessions.create(
      {
        cancel_url: `${publicSiteOrigin}/membership/?payment=cancelled`,
        customer_creation: "always",
        custom_fields: [
          {
            key: "membership_number",
            label: { custom: "Membership number (if known)", type: "custom" },
            optional: true,
            text: { maximum_length: 30 },
            type: "text",
          },
        ],
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: paymentMetadata,
        mode: "payment",
        name_collection: { individual: { enabled: true, optional: false } },
        payment_intent_data: {
          description: "Annual membership dues for Council 14772",
          metadata: paymentMetadata,
        },
        success_url: `${publicSiteOrigin}/membership/?payment=success`,
      },
      { stripeAccount: connectedAccountId },
    );

    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    return Response.redirect(session.url, 303);
  } catch (error) {
    console.error("Unable to create membership Checkout Session", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.redirect(`${publicSiteOrigin}/membership/?payment=unavailable`, 303);
  }
}
