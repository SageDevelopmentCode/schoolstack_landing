import type { ReactNode } from "react";
import { FadeInView } from "@/components/ui/FadeInView";
import { ACCENT_HIGHLIGHT, BOLD_HEADING, BRIGHT_NAV_OFFSET } from "@/components/home/bright-styles";
import {
  PRODUCT_SHOWCASE_SECTION_COPY,
  PRODUCT_SHOWCASE_SECTION_COPY_COMPACT,
} from "@/lib/marketing/showcase-section-copy";

type ProductShowcaseSectionProps = {
  children: ReactNode;
  header?: "full" | "compact" | "none";
  /** When true, pad top for fixed BrightNavbar (page-top showcase only). */
  underFixedNav?: boolean;
  className?: string;
};

export default function ProductShowcaseSection({
  children,
  header = "full",
  underFixedNav = false,
  className = "",
}: ProductShowcaseSectionProps) {
  const copy =
    header === "compact"
      ? PRODUCT_SHOWCASE_SECTION_COPY_COMPACT
      : PRODUCT_SHOWCASE_SECTION_COPY;

  const sectionPad = underFixedNav
    ? `${BRIGHT_NAV_OFFSET} pb-10 sm:pb-12 lg:pb-16`
    : "py-10 sm:py-12 lg:py-16";

  return (
    <section
      className={`bg-white ${sectionPad} ${className}`.trim()}
      aria-labelledby={header === "none" ? undefined : "product-showcase-heading"}
    >
      {header !== "none" ? (
        <div className="mx-auto max-w-[1400px] px-3 pb-8 lg:px-6 lg:pb-10">
          <FadeInView>
            <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">
              {copy.eyebrow}
            </p>
            <h2
              id="product-showcase-heading"
              className={`mt-4 max-w-[720px] text-[clamp(1.75rem,3.5vw,2.35rem)] ${BOLD_HEADING}`}
            >
              {copy.heading}{" "}
              <span className={ACCENT_HIGHLIGHT}>{copy.headingAccent}</span>
            </h2>
            <p className="mt-4 max-w-[600px] font-secondary text-[16px] leading-relaxed text-[#1d1a16]/70">
              {copy.body}
            </p>
          </FadeInView>
        </div>
      ) : null}
      {children}
    </section>
  );
}
