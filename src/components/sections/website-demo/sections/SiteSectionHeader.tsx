import type { ReactNode } from "react";
import { FadeInView } from "@/components/ui/FadeInView";
import DemoWebsiteSectionKicker from "../DemoWebsiteSectionKicker";
import { DEMO_ACCENT_HIGHLIGHT, DEMO_BODY, DEMO_H2, DEMO_INK } from "../bright-demo-theme";

type Props = {
  eyebrow?: string;
  heading: ReactNode;
  accent?: string;
  subtitle?: ReactNode;
  align?: "left" | "center" | "split";
  onDark?: boolean;
  className?: string;
};

/** Eyebrow, bold heading with optional highlighted accent, and subtitle. */
export default function SiteSectionHeader({
  eyebrow,
  heading,
  accent,
  subtitle,
  align = "left",
  onDark = false,
  className = "",
}: Props) {
  const headingColor = onDark ? "text-white" : DEMO_INK;
  const bodyColor = onDark ? "text-white/70!" : "";

  const title = (
    <h2 className={`${DEMO_H2} ${headingColor} ${eyebrow ? "mt-4" : ""} text-balance`}>
      {heading}
      {accent ? (
        <>
          {" "}
          <span className={DEMO_ACCENT_HIGHLIGHT}>{accent}</span>
        </>
      ) : null}
    </h2>
  );

  if (align === "split") {
    return (
      <FadeInView
        className={`flex flex-col gap-5 @5xl/site:flex-row @5xl/site:items-end @5xl/site:justify-between ${className}`}
      >
        <div className="max-w-[720px]">
          {eyebrow ? <DemoWebsiteSectionKicker onDark={onDark}>{eyebrow}</DemoWebsiteSectionKicker> : null}
          {title}
        </div>
        {subtitle ? (
          <p className={`${DEMO_BODY} ${bodyColor} max-w-[420px] @5xl/site:text-right`}>{subtitle}</p>
        ) : null}
      </FadeInView>
    );
  }

  return (
    <FadeInView
      className={`${align === "center" ? "mx-auto max-w-[760px] text-center" : "max-w-[760px]"} ${className}`}
    >
      {eyebrow ? <DemoWebsiteSectionKicker onDark={onDark}>{eyebrow}</DemoWebsiteSectionKicker> : null}
      {title}
      {subtitle ? (
        <p
          className={`${DEMO_BODY} ${bodyColor} mt-5 text-[17px] ${align === "center" ? "mx-auto max-w-[600px]" : "max-w-[600px]"}`}
        >
          {subtitle}
        </p>
      ) : null}
    </FadeInView>
  );
}
