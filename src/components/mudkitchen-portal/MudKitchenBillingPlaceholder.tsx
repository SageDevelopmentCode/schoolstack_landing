import { Mail } from "lucide-react";
import { MUDKITCHEN_PORTAL_THEME } from "@/lib/mudkitchen-portal/theme";

export default function MudKitchenBillingPlaceholder() {
  const T = MUDKITCHEN_PORTAL_THEME;

  return (
    <div className="space-y-8">
      <div>
        <p
          className="font-secondary text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: T.textSecondary }}
        >
          Billing
        </p>
        <h1
          className="font-heading mt-2 text-[clamp(1.75rem,3vw,2.25rem)] font-medium leading-tight"
          style={{ color: T.textPrimary }}
        >
          MudKitchen subscription
        </h1>
        <p
          className="font-secondary mt-3 max-w-[640px] text-[15px] leading-relaxed"
          style={{ color: T.textSecondary }}
        >
          Invoicing and subscription management for your MudKitchen account will
          appear here soon.
        </p>
      </div>

      <div
        className="rounded-2xl border px-6 py-10 text-center sm:px-10"
        style={{
          backgroundColor: T.surface,
          borderColor: T.border,
        }}
      >
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: T.claySoft, color: T.clay }}
        >
          <Mail className="h-6 w-6" />
        </div>
        <h2
          className="font-heading text-xl font-medium"
          style={{ color: T.textPrimary }}
        >
          Coming soon
        </h2>
        <p
          className="font-secondary mx-auto mt-3 max-w-md text-[15px] leading-relaxed"
          style={{ color: T.textSecondary }}
        >
          Questions about billing in the meantime? Email us at{" "}
          <a
            href="mailto:support@trymudkitchen.com"
            className="font-semibold underline-offset-2 hover:underline"
            style={{ color: T.accent }}
          >
            support@trymudkitchen.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
