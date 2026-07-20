import Stripe from "stripe";

const DUMMY_SECRET_KEY = "sk_test_dummy";

export function createMockStripeClient(overrides?: {
  sessionsCreate?: (
    params: Stripe.Checkout.SessionCreateParams,
  ) => Promise<Stripe.Checkout.Session>;
}): Stripe {
  const stripe = new Stripe(DUMMY_SECRET_KEY);

  return {
    checkout: {
      sessions: {
        create:
          overrides?.sessionsCreate ??
          (async () =>
            ({
              id: "cs_test_mock",
              url: "https://checkout.stripe.test/mock",
            }) as Stripe.Checkout.Session),
      },
    },
    webhooks: stripe.webhooks,
  } as unknown as Stripe;
}

export function signWebhookPayload(payload: string, secret: string): string {
  const stripe = new Stripe(DUMMY_SECRET_KEY);
  return stripe.webhooks.generateTestHeaderString({
    payload,
    secret,
  });
}

export function buildCheckoutSessionCompletedEvent(
  session: Stripe.Checkout.Session,
): Stripe.Event {
  return {
    id: "evt_test_webhook",
    object: "event",
    api_version: "2024-11-20.acacia",
    created: Math.floor(Date.now() / 1000),
    data: { object: session },
    livemode: false,
    pending_webhooks: 0,
    request: null,
    type: "checkout.session.completed",
  } as Stripe.Event;
}
