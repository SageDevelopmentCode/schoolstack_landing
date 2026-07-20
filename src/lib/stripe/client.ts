import Stripe from "stripe";

let stripeClient: Stripe | null = null;
let stripeClientOverride: Stripe | null = null;

export function setStripeClientForTests(client: Stripe | null): void {
  stripeClientOverride = client;
  if (!client) {
    stripeClient = null;
  }
}

export function getStripeClient(): Stripe {
  if (stripeClientOverride) {
    return stripeClientOverride;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }
  return secret;
}

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SITE_URL");
  }
  return url.replace(/\/$/, "");
}
