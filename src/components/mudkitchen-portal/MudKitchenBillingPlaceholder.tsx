"use client";

import { FadeInView } from "@/components/ui/FadeInView";
import PortalPageHero from "@/components/mudkitchen-portal/ui/PortalPageHero";
import PortalCard from "@/components/mudkitchen-portal/ui/PortalCard";
import { usePortalTheme } from "@/components/mudkitchen-portal/PortalThemeProvider";

export default function MudKitchenBillingPlaceholder() {
  const T = usePortalTheme();

  return (
    <>
      <PortalPageHero
        eyebrow="Billing"
        title="Subscription & invoices"
        subtitle="Invoicing and subscription management for your MudKitchen account will appear here soon."
      />

      <section className="px-6 pb-20 lg:px-16 lg:pb-24">
        <div className="mx-auto max-w-[760px]">
          <FadeInView>
            <PortalCard className="text-center">
              <p
                className="font-secondary text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: T.textSecondary }}
              >
                Coming soon
              </p>
              <p
                className="font-heading mt-4 text-xl font-medium"
                style={{ color: T.textPrimary }}
              >
                We&apos;re building this out
              </p>
              <p
                className="font-secondary mx-auto mt-4 max-w-md text-[15px] leading-relaxed"
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
            </PortalCard>
          </FadeInView>
        </div>
      </section>
    </>
  );
}
