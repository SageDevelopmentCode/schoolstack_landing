import Stripe from "stripe";

const DUMMY_SECRET_KEY = "sk_test_dummy";

export function createMockStripeClient(overrides?: {
  sessionsCreate?: (
    params: Stripe.Checkout.SessionCreateParams,
  ) => Promise<Stripe.Checkout.Session>;
  accountsCreateLoginLink?: (
    accountId: string,
  ) => Promise<Stripe.LoginLink>;
  paymentIntentsRetrieve?: (
    paymentIntentId: string,
  ) => Promise<Stripe.PaymentIntent>;
  paymentMethodsRetrieve?: (
    paymentMethodId: string,
  ) => Promise<Stripe.PaymentMethod>;
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
    accounts: {
      createLoginLink:
        overrides?.accountsCreateLoginLink ??
        (async (accountId: string) =>
          ({
            object: "login_link",
            created: Math.floor(Date.now() / 1000),
            url: `https://connect.stripe.test/express/${accountId}`,
          }) as Stripe.LoginLink),
    },
    paymentIntents: {
      retrieve:
        overrides?.paymentIntentsRetrieve ??
        (async (paymentIntentId: string) =>
          ({
            id: paymentIntentId,
            object: "payment_intent",
            payment_method: "pm_test_mock",
          }) as Stripe.PaymentIntent),
    },
    paymentMethods: {
      retrieve:
        overrides?.paymentMethodsRetrieve ??
        (async (paymentMethodId: string) =>
          ({
            id: paymentMethodId,
            object: "payment_method",
            type: "card",
            card: {
              brand: "visa",
              last4: "4242",
            },
          }) as Stripe.PaymentMethod),
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

export function buildCheckoutSessionEvent(
  type:
    | "checkout.session.completed"
    | "checkout.session.async_payment_succeeded"
    | "checkout.session.async_payment_failed",
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
    type,
  } as Stripe.Event;
}

export function buildCheckoutSessionCompletedEvent(
  session: Stripe.Checkout.Session,
): Stripe.Event {
  return buildCheckoutSessionEvent("checkout.session.completed", session);
}
