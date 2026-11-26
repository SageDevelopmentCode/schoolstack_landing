"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ClipboardList,
  CreditCard,
  FileSignature,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { rememberSnapshotPath } from "@/components/demo/useSnapshotLink";
import { useViewBeacon } from "@/lib/outreach/view-beacon";
import { MUDKITCHEN_LOGO, SAGEFIELD_PHOTOS } from "@/components/home-garden/assets";
import { Pill, Tape, Tick, btnButter, btnOutline, btnPop } from "@/components/garden/ui";
import {
  SNAPSHOT_AREAS,
  SNAPSHOT_AREA_LABEL,
  SNAPSHOT_FIX_LABEL,
  type OutreachSnapshot,
  type SnapshotArea,
} from "@/data/outreach/types";
import { GET_STARTED_PAGE_PATH } from "@/lib/marketing/book-demo";
import { MUDKITCHEN_CONTACT } from "@/lib/site";
import { SNAPSHOT_COPY as COPY } from "./snapshot-copy";

const AREA_STYLE: Record<SnapshotArea, { icon: LucideIcon; tint: string; tape: string; rotate: string }> = {
  find: { icon: Search, tint: "bg-[var(--sf-sky)]", tape: "var(--sf-sky)", rotate: "-0.6deg" },
  tour: { icon: MapPin, tint: "bg-[var(--sf-butter)]", tape: "var(--sf-butter)", rotate: "0.5deg" },
  apply: { icon: ClipboardList, tint: "bg-[var(--sf-mint)]", tape: "var(--sf-mint)", rotate: "-0.4deg" },
  enroll: { icon: FileSignature, tint: "bg-[var(--sf-lav)]", tape: "var(--sf-lav)", rotate: "0.6deg" },
  pay: { icon: CreditCard, tint: "bg-[var(--sf-peach)]", tape: "var(--sf-peach)", rotate: "-0.5deg" },
  updates: { icon: MessageCircle, tint: "bg-[var(--sf-sky)]", tape: "var(--sf-sky)", rotate: "0.4deg" },
  website: { icon: Globe, tint: "bg-[var(--sf-mint)]", tape: "var(--sf-mint)", rotate: "-0.6deg" },
};

/** Only show the Mobile speed sticker for a poor score (Google PageSpeed's red band, 0–49). */
const PAGESPEED_SHOW_BELOW = 50;

const focusRing ="focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30";

function formatDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const noSubscribe = () => () => {};

/**
 * True when they arrived from the QR card in the handwritten letter (`?via=letter`).
 * Read after mount so the page can be prerendered.
 */
function useCameFromLetter() {
  return useSyncExternalStore(
    noSubscribe,
    () => new URLSearchParams(window.location.search).get("via") === "letter",
    () => false,
  );
}

/**
 * True when an admin opened this page with `?preview=1`.
 * Read after mount so the page can be prerendered. Demo links keep the flag so
 * the demo's view beacon stays silent (same check as `useViewBeacon`).
 */
function useIsPreviewVisit() {
  return useSyncExternalStore(
    noSubscribe,
    () => new URLSearchParams(window.location.search).has("preview"),
    () => false,
  );
}

/** A short note for someone who scanned the QR card from Julius's handwritten letter. */
function LetterGreeting({ firstName, demoHref }: { firstName: string; demoHref: string }) {
  return (
    <section aria-label="From the letter" className="mx-auto max-w-6xl px-6 pt-6 sm:px-10" data-testid="snapshot-letter-greeting">
      <div className="flex flex-col gap-4 rounded-[22px] border-2 border-[var(--sf-ink)] bg-[var(--sf-butter)] px-5 py-4 shadow-[0_4px_0_0_var(--sf-ink)] sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 text-[15px] font-bold leading-snug">
          <span className="sf-hand mr-1 text-2xl text-[var(--sf-forest)]">Hi {firstName},</span> thanks for scanning the card.
          Below is the look at your enrollment I mentioned, and your demo is one tap away.
          <span className="sf-hand ml-1 text-2xl text-[var(--sf-forest)]">Julius</span>
        </p>
        <Link href={demoHref} target="_blank" rel="noopener noreferrer" className={`${btnPop} shrink-0 !px-5 !py-2.5 text-[15px]`}>
          Open your demo
        </Link>
      </div>
    </section>
  );
}

export default function SnapshotPage({
  slug,
  token,
  schoolName,
  demoHref,
  snapshot,
  letterFirstName,
}: {
  slug: string;
  token: string;
  schoolName: string;
  /** Their demo's public path (`/demo/<route>`). */
  demoHref: string;
  snapshot: OutreachSnapshot;
  /** Founder's first name when the plan has a handwritten letter; greets them after a QR scan. */
  letterFirstName?: string;
}) {
  const fromLetter = useCameFromLetter();
  const previewVisit = useIsPreviewVisit();
  // Tells Julius (Discord) the school opened it.
  useViewBeacon({
    endpoint: "/api/outreach-snapshot/view",
    storageKey: `snapshot-viewed:${slug}`,
    body: { slug, token, via: fromLetter ? "letter" : undefined },
  });
  // Demo links say where they came from, for the demo's own Discord alert.
  // Preview visits keep `preview=1` so an admin check does not count as a school visit.
  const demoLink = (path = "") => {
    const url = new URL(`${demoHref}${path}`, "https://trymudkitchen.com");
    url.searchParams.set("via", fromLetter ? "letter" : "snapshot");
    if (previewVisit) url.searchParams.set("preview", "1");
    return `${url.pathname}${url.search}${url.hash}`;
  };
  // Lets their demo (opened in a new tab) link back here on this device.
  useEffect(() => {
    rememberSnapshotPath(slug, `/snapshot/${slug}/${token}`);
  }, [slug, token]);
  const speed = snapshot.pageSpeed;
  // Journey order (find → tour → apply → enroll → pay → updates → website); stable within an area.
  const observations = [...snapshot.observations].sort(
    (a, b) => SNAPSHOT_AREAS.indexOf(a.area) - SNAPSHOT_AREAS.indexOf(b.area),
  );

  return (
    <div className="overflow-x-clip text-[var(--sf-ink)]">
      {/* Top bar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 pt-6 sm:px-10">
        <Link href="/" className={`inline-flex items-center gap-2 rounded-full ${focusRing}`} aria-label="MudKitchen home">
          <Image src={MUDKITCHEN_LOGO} alt="" width={36} height={36} className="h-9 w-9" />
          <span className="text-lg font-extrabold">MudKitchen</span>
        </Link>
        <p className="hidden text-sm font-extrabold text-[var(--sf-soft)] sm:block">{COPY.preparedBy}</p>
      </header>

      {fromLetter && letterFirstName ? <LetterGreeting firstName={letterFirstName} demoHref={demoLink()} /> : null}

      {/* Hero */}
      <section className="sf-grid">
        <div className="mx-auto max-w-6xl px-6 pb-14 pt-12 sm:px-10 lg:pb-20 lg:pt-16">
          <h1 className="sf-display max-w-4xl text-[11vw] leading-[0.9] sm:text-6xl lg:text-[4.6rem]">
            {COPY.title(schoolName)}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--sf-soft)]">{COPY.intro(schoolName)}</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link href={demoLink()} target="_blank" rel="noopener noreferrer" className={btnPop}>
              {COPY.ctaDemo}
              <ArrowUpRight className="h-5 w-5" strokeWidth={2.4} aria-hidden />
            </Link>
            <a
              href="#snapshot-noticed"
              className={`inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-extrabold tabular-nums ring-2 ring-[var(--sf-ink)] transition-colors hover:bg-[var(--sf-butter)] ${focusRing}`}
            >
              {COPY.countLabel(observations.length)}
              <ArrowDown className="h-4 w-4 motion-safe:animate-bounce" strokeWidth={2.6} aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* Tools families juggle today → one place */}
      {snapshot.toolStack && snapshot.toolStack.length >= 2 ? (
        <section className="pb-12 lg:pb-16" aria-labelledby="snapshot-tools">
          <div className="mx-auto max-w-6xl px-6 sm:px-10">
            <div className="rounded-[28px] border-2 border-[var(--sf-ink)] bg-white p-5 shadow-[0_6px_0_0_var(--sf-ink)] sm:p-7">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">{COPY.toolsKicker}</p>
              <h2 id="snapshot-tools" className="sf-display mt-1 text-[1.9rem] leading-[1.05] sm:text-[2.2rem]">
                {COPY.toolsTitle(snapshot.toolStack.length)}
              </h2>
              <div className="mt-5 flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
                <ul className="m-0 grid flex-1 list-none grid-cols-1 gap-2.5 p-0 min-[460px]:grid-cols-2 md:grid-cols-3">
                  {snapshot.toolStack.map((tool) => (
                    <li key={tool.name} className="min-w-0 rounded-2xl border-[1.5px] border-dashed border-[var(--sf-ink)]/25 bg-[var(--sf-cream)] px-3.5 py-2.5">
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block rounded-md ${focusRing}`}
                      >
                        <span className="block truncate text-[15px] font-extrabold text-[var(--sf-ink)]">
                          {tool.name}
                          {tool.network ? (
                            <span className="ml-1.5 text-[12px] font-bold text-[var(--sf-soft)]">{COPY.toolsNetworkNote(tool.network)}</span>
                          ) : null}
                        </span>
                        <span className="line-clamp-2 block text-[13px] font-semibold leading-snug text-[var(--sf-soft)]">{tool.usedFor}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <span className="self-center text-[var(--sf-ink)]/40" aria-hidden>
                  <ArrowRight className="h-7 w-7 rotate-90 lg:rotate-0" strokeWidth={2.6} />
                </span>
                <div className="flex items-center gap-3 rounded-2xl bg-[var(--sf-mint)] px-4 py-3.5 ring-2 ring-[var(--sf-ink)] lg:w-[250px]">
                  <Image src={MUDKITCHEN_LOGO} alt="" width={40} height={40} className="h-10 w-10 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[15px] font-extrabold text-[var(--sf-forest)]">{COPY.toolsOneLogin}</p>
                    <p className="text-[13.5px] font-semibold leading-snug text-[var(--sf-ink)]/80">{COPY.toolsOneLoginBody}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Observations */}
      <section id="snapshot-noticed" className="scroll-mt-8 pb-16 lg:pb-24" aria-labelledby="snapshot-observations">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:px-10 lg:grid-cols-[1fr_260px] lg:items-start">
          <h2 id="snapshot-observations" className="sr-only">
            What we noticed
          </h2>
          <ol className="m-0 grid list-none gap-7 p-0">
            {observations.map((o, i) => {
              const style = AREA_STYLE[o.area];
              const Icon = style.icon;
              const inDemo = o.fix.label === "in_demo";
              return (
                <li
                  key={`${o.area}-${i}`}
                  className="relative rounded-[28px] border-2 border-[var(--sf-ink)] bg-[var(--sf-paper)] p-5 shadow-[0_6px_0_0_var(--sf-ink)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0 sm:p-7"
                  style={{ rotate: style.rotate }}
                >
                  <Tape color={style.tape} className="-top-3 left-10 -rotate-3" />
                  <div className="flex items-start gap-3">
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ring-2 ring-[var(--sf-ink)] ${style.tint}`}
                      aria-hidden
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.4} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">
                        {String(i + 1).padStart(2, "0")} · {SNAPSHOT_AREA_LABEL[o.area]}
                      </p>
                      <h3 className="sf-display mt-1 text-2xl leading-[1.05] sm:text-[1.9rem]">{o.gap}</h3>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-3 rounded-2xl bg-[var(--sf-cream)] p-4">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">{COPY.todayLabel}</p>
                        <p className="mt-2 text-[15.5px] leading-relaxed text-[var(--sf-ink)]/85">{o.saw}</p>
                      </div>
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--sf-clay-deep)]">{COPY.impactLabel}</p>
                        <p className="mt-1 text-[15px] leading-relaxed text-[var(--sf-ink)]/85">{o.impact}</p>
                      </div>
                      <p className="mt-auto text-[13px] text-[var(--sf-soft)]">
                        {COPY.sourceLabel}:{" "}
                        <a
                          href={o.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-extrabold underline decoration-[var(--sf-moss)] underline-offset-2 hover:text-[var(--sf-ink)] ${focusRing}`}
                        >
                          {o.source || hostOf(o.url)}
                        </a>{" "}
                        · {formatDate(o.readOn)}
                      </p>
                    </div>
                    <div className={`flex flex-col rounded-2xl p-4 ${inDemo ? "bg-[var(--sf-mint)]" : "bg-[var(--sf-butter)]/60"}`}>
                      <span
                        className={`inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-extrabold ring-1 ring-[var(--sf-ink)]/25 ${
                          inDemo ? "text-[var(--sf-forest)]" : "text-[#6b4f00]"
                        }`}
                      >
                        {inDemo ? <Tick className="h-4 w-4" /> : <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />}
                        {SNAPSHOT_FIX_LABEL[o.fix.label]}
                      </span>
                      <p className="mt-3 text-[15.5px] leading-relaxed text-[var(--sf-ink)]">{o.fix.text}</p>
                      {inDemo ? (
                        <Link
                          href={demoLink(o.fix.demoPath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`mt-auto inline-flex items-center gap-1.5 rounded-full pt-3 text-sm font-extrabold text-[var(--sf-forest)] hover:underline ${focusRing}`}
                        >
                          {COPY.openInDemo}
                          <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Rail: speed sticker + CTA */}
          <aside className="grid gap-6 lg:sticky lg:top-8">
            {speed && speed.mobileScore < PAGESPEED_SHOW_BELOW ? (
              <div
                className="relative rounded-md bg-[var(--sf-butter)] p-5 shadow-[0_14px_30px_-16px_rgba(43,36,29,0.5)]"
                style={{ rotate: "1.5deg" }}
              >
                <Tape color="var(--sf-peach)" className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#6b4f00]">{COPY.pageSpeedTitle}</p>
                <p className="sf-display mt-1 text-[3.6rem] leading-none tabular-nums">
                  {speed.mobileScore}
                  <span className="text-2xl text-[var(--sf-ink)]/60">/100</span>
                </p>
                <p className="mt-2 text-[13px] leading-snug text-[var(--sf-ink)]/80">{COPY.pageSpeedBody}</p>
                <p className="mt-2 text-[12px] text-[var(--sf-ink)]/70">
                  {hostOf(speed.url)} · {formatDate(speed.checkedOn)}
                </p>
              </div>
            ) : null}
            <div className="rounded-[26px] border-2 border-[var(--sf-ink)] bg-white p-5 shadow-[0_6px_0_0_var(--sf-ink)]">
              <p className="sf-display text-2xl leading-[1.05]">{COPY.ctaTitle}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--sf-soft)]">{COPY.ctaBody}</p>
              <Link href={demoLink()} target="_blank" rel="noopener noreferrer" className={`${btnPop} mt-4 w-full !px-5 !py-3 text-[15px]`}>
                {COPY.ctaDemo}
              </Link>
              <Link
                href={GET_STARTED_PAGE_PATH}
                className={`${btnOutline} mt-3 w-full whitespace-nowrap !px-3 !py-[10px] text-[14px]`}
              >
                {COPY.ctaBookShort}
              </Link>
              <div className="mt-5 border-t-2 border-dashed border-[var(--sf-ink)]/15 pt-4" data-testid="snapshot-contact">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">{COPY.contactLead}</p>
                <ul className="m-0 mt-2 grid list-none gap-1.5 p-0">
                  <li>
                    <a
                      href={`mailto:${MUDKITCHEN_CONTACT.email}`}
                      className={`inline-flex max-w-full items-center gap-2 rounded-md text-[14px] font-extrabold text-[var(--sf-ink)] hover:text-[var(--sf-clay-deep)] hover:underline ${focusRing}`}
                    >
                      <Mail className="h-4 w-4 shrink-0 text-[var(--sf-forest)]" strokeWidth={2.4} aria-hidden />
                      <span className="min-w-0 break-all">{MUDKITCHEN_CONTACT.email}</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={MUDKITCHEN_CONTACT.phoneHref}
                      className={`inline-flex items-center gap-2 rounded-md text-[14px] font-extrabold tabular-nums text-[var(--sf-ink)] hover:text-[var(--sf-clay-deep)] hover:underline ${focusRing}`}
                    >
                      <Phone className="h-4 w-4 shrink-0 text-[var(--sf-forest)]" strokeWidth={2.4} aria-hidden />
                      {MUDKITCHEN_CONTACT.phoneDisplay}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Proof: the page's one forest panel */}
      <section className="px-3 pb-16 lg:px-6 lg:pb-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-[44px] bg-[var(--sf-forest)] px-6 py-12 text-white sm:px-10 lg:grid-cols-[1.3fr_1fr] lg:px-14 lg:py-16">
          <div>
            <Pill tint="ink">🌱 {COPY.proofKicker}</Pill>
            <h2 className="sf-display mt-5 text-5xl leading-[0.95] md:text-6xl">
              {COPY.proofLead} <span className="text-[var(--sf-butter)]">{COPY.proofAccent}</span>
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">{COPY.proofBody}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href={GET_STARTED_PAGE_PATH} className={btnButter}>
                {COPY.ctaBook}
                <ArrowRight className="h-5 w-5" strokeWidth={2.4} aria-hidden />
              </Link>
              <a
                href={COPY.proofStoryHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/50 px-6 py-[14px] text-base font-extrabold text-white transition-colors hover:bg-white/10 ${focusRing}`}
              >
                {COPY.proofStory}
                <ArrowUpRight className="h-5 w-5" strokeWidth={2.4} aria-hidden />
              </a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[300px]" style={{ rotate: "2deg" }}>
            <div className="sf-polaroid relative bg-white p-3 pb-10">
              <Tape color="var(--sf-butter)" className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />
              <Image
                src={SAGEFIELD_PHOTOS.running.src}
                alt={SAGEFIELD_PHOTOS.running.alt}
                width={SAGEFIELD_PHOTOS.running.w}
                height={SAGEFIELD_PHOTOS.running.h}
                sizes="300px"
                className="aspect-[4/3] w-full rounded-[3px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 pb-12 sm:px-10">
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--sf-soft)]">{COPY.footnote}</p>
      </footer>
    </div>
  );
}
