import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Feature, FeatureRole } from "@/lib/marketing/features/types";
import { featurePath } from "@/lib/marketing/features/paths";
import { IconStamp, PlatformChips, TINT_BG, featureCoverShots } from "./feature-ui";

const TILTS = [-1.4, 1.1, -0.7, 1.6, -1.8, 0.8];

/**
 * A feature as a tilted toy card: stamp-corner icon, name, one-liner, a web
 * screenshot with the phone screen peeking over it, and platform chips. The
 * whole card is one link (an `after:absolute` overlay on the heading link).
 */
export default function FeatureCard({
  feature,
  index,
  role,
  headingAs: Heading = "h3",
  showShots = true,
}: {
  feature: Feature;
  index: number;
  /** Show this role's line and screens, and open the feature page on its tab. */
  role?: FeatureRole;
  headingAs?: "h2" | "h3";
  showShots?: boolean;
}) {
  const { web, mobile } = featureCoverShots(feature, role);
  const line = (role && feature.roleLines[role]) || feature.oneLiner;
  const href = role && feature.roles.length > 1 ? `${featurePath(feature.slug)}#for-${role}` : featurePath(feature.slug);
  const tilt = TILTS[index % TILTS.length];
  return (
    <article
      className="group relative flex h-full flex-col rounded-[28px] border-2 border-[var(--sf-ink)] bg-white p-6 shadow-[0_6px_0_0_var(--sf-ink)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-within:!rotate-0 focus-within:-translate-y-1 hover:!rotate-0 hover:-translate-y-1.5 hover:shadow-[0_10px_0_0_var(--sf-ink)] motion-reduce:transition-none"
      style={{ rotate: `${tilt}deg` }}
    >
      <div className="flex items-start justify-between gap-4">
        <Heading className="sf-display text-[1.75rem] leading-[1] text-[var(--sf-ink)]">
          <Link
            href={href}
            className="rounded-md after:absolute after:inset-0 after:rounded-[26px] after:content-[''] focus-visible:outline-none focus-visible:after:ring-4 focus-visible:after:ring-[var(--sf-clay)]/35"
          >
            {feature.name}
          </Link>
        </Heading>
        <IconStamp feature={feature} size="sm" />
      </div>
      <p className="mt-3 text-[15.5px] leading-relaxed text-[var(--sf-ink)]/80">{line}</p>

      {showShots && web ? (
        <div className={`relative mt-5 overflow-hidden rounded-[18px] border-2 border-[var(--sf-ink)] ${TINT_BG[feature.tint]} px-4 pt-4`} aria-hidden="true">
          <div className="relative overflow-hidden rounded-t-[10px] border-2 border-b-0 border-[var(--sf-ink)]/70 bg-white" style={{ aspectRatio: "16 / 10" }}>
            <Image src={web.src} alt="" fill sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 85vw" className="object-cover object-left-top" loading="lazy" />
          </div>
          {mobile ? (
            <div className="absolute -bottom-6 right-3 hidden w-[26%] rotate-3 rounded-[14px] bg-white p-1 shadow-[0_12px_24px_-12px_rgba(43,36,29,0.6)] ring-2 ring-[var(--sf-ink)] transition-transform duration-500 group-hover:-translate-y-2 sm:block">
              <div className="relative overflow-hidden rounded-[10px]" style={{ aspectRatio: `${mobile.width} / ${mobile.height}` }}>
                <Image src={mobile.src} alt="" fill sizes="110px" className="object-cover object-top" loading="lazy" />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="min-h-8 flex-1" aria-hidden="true" />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-[var(--sf-ink)]/20 pt-4">
        <PlatformChips platforms={feature.platforms} />
        <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[var(--sf-clay-deep)]" aria-hidden="true">
          Explore <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
