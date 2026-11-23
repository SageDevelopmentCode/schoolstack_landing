"use client";

import { useState } from "react";
import { ArrowUpRight, Check, ClipboardCopy, Mailbox, Printer, StickyNote } from "lucide-react";
import { GCard, GChip, G_INPUT, G_LABEL, gBtnOutlineSm, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
import { BusyLabel, GardenNotice } from "@/components/school-admin/garden/kit";
import type { OutreachLetter } from "@/data/outreach/types";
import type { DemoOutreach } from "@/lib/admin-crm/demo-outreach-types";
import { letterNeedsAddress, letterProblems, letterShortUrlLabel, letterText } from "@/lib/admin-crm/outreach-letter";
import { adminToast } from "@/lib/school-admin/admin-toast";
import { PRODUCTION_SITE_URL } from "@/lib/site";
import { formatDay } from "./research-ui";
import type { WorkspaceRow } from "./useResearchWorkspaceModel";

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function SectionLabel({ children }: { children: string }) {
  return <p className="m-0 mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">{children}</p>;
}

/** The letter as Julius copies it out: a readable serif, line breaks kept. */
function LetterText({ letter }: { letter: OutreachLetter }) {
  return (
    <div
      className="whitespace-pre-line rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/12 bg-[#fffdf7] px-5 py-4 text-[16.5px] leading-[1.7] text-[var(--sf-ink)] shadow-[0_2px_0_0_rgba(43,36,29,0.06)]"
      style={{ fontFamily: 'Georgia, "Iowan Old Style", "Times New Roman", serif' }}
      data-testid="research-letter-text"
    >
      {letterText(letter)}
    </div>
  );
}

function LogMailed({ slug, onLogged }: { slug: string; onLogged: (next: DemoOutreach) => void }) {
  const [mailedOn, setMailedOn] = useState(todayLocal);
  const [saving, setSaving] = useState(false);

  async function log() {
    setSaving(true);
    const errorId = `research-letter-error-${slug}`;
    try {
      const res = await fetch(`/api/admin/demo-outreach/${encodeURIComponent(slug)}/letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mailedOn }),
      });
      const json = (await res.json().catch(() => null)) as { outreach?: DemoOutreach; error?: string } | null;
      if (!res.ok || !json?.outreach) throw new Error(json?.error ?? `Request failed (${res.status})`);
      adminToast.dismiss(errorId);
      onLogged(json.outreach);
    } catch (error) {
      adminToast.error("Couldn't log the letter.", {
        id: errorId,
        description: `${error instanceof Error ? error.message : "Try again."} Nothing was logged.`,
        action: { label: "Retry", onClick: () => void log() },
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void log();
      }}
      className="flex flex-wrap items-end gap-2" aria-label="Log the letter as mailed">
      <div>
        <label htmlFor={`letter-mailed-${slug}`} className={G_LABEL}>
          Mailed on
        </label>
        <input
          id={`letter-mailed-${slug}`}
          type="date"
          value={mailedOn}
          max={todayLocal()}
          onChange={(e) => setMailedOn(e.target.value)}
          className={`${G_INPUT} w-[170px]`}
          data-garden-skip
          required
        />
      </div>
      <button type="submit" className={gBtnPopSm} disabled={saving || !mailedOn} aria-busy={saving || undefined} data-testid="research-letter-log">
        <BusyLabel busy={saving} busyLabel="Logging…" icon={<Mailbox className="h-4 w-4" aria-hidden />}>
          Log letter mailed
        </BusyLabel>
      </button>
      <span className="text-[12.5px] font-bold text-[var(--sf-soft)]">The first email comes due 5 business days later.</span>
    </form>
  );
}

/**
 * The handwritten letter for a school: the text to copy by hand, the envelope, the sticky note, the
 * QR card to print, what to check, and "Log letter mailed" (which starts the email clock).
 */
export function SchoolLetterCard({
  row,
  index,
  onOutreach,
}: {
  row: WorkspaceRow;
  index: number;
  onOutreach: (next: DemoOutreach) => void;
}) {
  const { plan, school, journey } = row;
  const [copied, setCopied] = useState(false);
  const letter = plan?.letter;
  if (!letter || !plan || !school.demo_slug || !journey.letter) return null;

  const problems = letterProblems(plan);
  const needsAddress = letterNeedsAddress(letter);
  const hookFact = letter.founderFacts.find((f) => f.fact === letter.hook);
  const mailedAt = journey.letter.mailedAt;
  const emailDue = journey.letter.firstEmailDueAt;
  const shortLabel = letterShortUrlLabel(letter.shortCode, PRODUCTION_SITE_URL);

  async function copyLetter() {
    try {
      await navigator.clipboard.writeText(letterText(letter!));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      adminToast.error("Couldn't copy the letter.", { id: "research-letter-copy-error" });
    }
  }

  return (
    <GCard
      kicker="By hand · before the first email"
      title="Handwritten letter"
      index={index}
      action={
        mailedAt ? (
          <GChip tone="success">Mailed {formatDay(mailedAt)}</GChip>
        ) : needsAddress ? (
          <span className="flex flex-wrap items-center gap-1.5">
            <GChip tone="alert">To write and mail</GChip>
            <GChip tone="warning">Address needed</GChip>
          </span>
        ) : (
          <GChip tone="alert">To write and mail</GChip>
        )
      }
      data-testid="research-letter-card"
    >
      {problems.length > 0 ? (
        <div className="mb-4">
          <GardenNotice tone="warning" title="Fix the letter in its plan file first">
            {problems.join(" ")}
          </GardenNotice>
        </div>
      ) : null}

      <p className="m-0 text-[14px] font-semibold leading-relaxed text-[var(--sf-ink)]/80">
        <span className="font-extrabold text-[var(--sf-ink)]">Opens on: </span>
        {letter.hook}
        {hookFact ? (
          <>
            {" "}
            <a href={hookFact.url} target="_blank" rel="noopener noreferrer" className={gLinkSm}>
              {hookFact.source}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          </>
        ) : null}
      </p>

      <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <SectionLabel>The letter · copy it out by hand</SectionLabel>
            <button type="button" className={gBtnOutlineSm} onClick={() => void copyLetter()}>
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <ClipboardCopy className="h-4 w-4" aria-hidden />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <LetterText letter={letter} />
          <p className="m-0 mt-2 text-[12.5px] font-bold text-[var(--sf-soft)]">
            Sign it, and write your cell number under your name.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <SectionLabel>Envelope</SectionLabel>
            <address className="rounded-[14px] border-[1.5px] border-dashed border-[var(--sf-ink)]/20 bg-white px-4 py-3 text-[14.5px] font-bold not-italic leading-relaxed text-[var(--sf-ink)]">
              {letter.founder.fullName}
              <br />
              {plan.schoolName}
              {letter.mailTo ? (
                letter.mailTo.lines.map((line) => (
                  <span key={line}>
                    <br />
                    {line}
                  </span>
                ))
              ) : (
                <span className="mt-2 block text-[13.5px] font-extrabold text-[#6b4f00]" data-testid="research-letter-needs-address">
                  Address needed
                </span>
              )}
            </address>
            {letter.mailTo ? (
              <p className="m-0 mt-1 text-[12px] font-semibold text-[var(--sf-soft)]">
                From{" "}
                <a href={letter.mailTo.url} target="_blank" rel="noopener noreferrer" className={gLinkSm}>
                  {letter.mailTo.source}
                </a>
                . Hand-address it, real stamp, your name and address on the back, no logo.
              </p>
            ) : (
              <p className="m-0 mt-1 text-[12px] font-semibold text-[var(--sf-soft)]">
                The school doesn&apos;t publish a business address we could use. Find one (a suite, PO box or the
                building they meet in, never a home), then add it to the plan. Leads are under Check before mailing.
              </p>
            )}
          </div>

          <div>
            <SectionLabel>Sticky note on the fold</SectionLabel>
            <p
              className="m-0 flex items-start gap-2 rounded-[6px] bg-[#fff2a8] px-4 py-3 text-[20px] leading-snug text-[var(--sf-ink)] shadow-[0_3px_0_0_rgba(43,36,29,0.12)]"
              style={{ fontFamily: "var(--font-sf-hand), 'Gochi Hand', cursive" }}
            >
              <StickyNote className="mt-1 h-4 w-4 shrink-0 text-[var(--sf-ink)]/50" aria-hidden />
              {letter.stickyNote}
            </p>
          </div>

          <div>
            <SectionLabel>QR card in the envelope</SectionLabel>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`/admin/research/letter/${encodeURIComponent(school.demo_slug)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={gBtnOutlineSm}
                data-testid="research-letter-print"
              >
                <Printer className="h-4 w-4" aria-hidden />
                Print QR card
              </a>
              <span className="font-mono text-[12.5px] font-bold text-[var(--sf-ink)]/75">{shortLabel}</span>
            </div>
            <p className="m-0 mt-1 text-[12px] font-semibold text-[var(--sf-soft)]">Opens their snapshot and demo. A scan pings Discord.</p>
          </div>

          {letter.checkBeforeMailing.length > 0 ? (
            <div>
              <SectionLabel>Check before mailing</SectionLabel>
              <ul className="m-0 grid list-none gap-1.5 p-0">
                {letter.checkBeforeMailing.map((item) => (
                  <li key={item} className="flex gap-2 text-[13px] font-semibold leading-snug text-[var(--sf-ink)]/85">
                    <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--sf-clay)]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <details className="mt-4 rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-4 py-2">
        <summary className="cursor-pointer text-[13px] font-extrabold text-[var(--sf-ink)]">
          What we know about {letter.founder.firstName} ({letter.founderFacts.length})
        </summary>
        <ul className="m-0 mt-2 grid list-none gap-2 p-0 pb-2">
          {letter.founderFacts.map((fact) => (
            <li key={fact.fact} className="text-[13px] font-semibold leading-snug text-[var(--sf-ink)]/85">
              {fact.fact}{" "}
              <a href={fact.url} target="_blank" rel="noopener noreferrer" className={gLinkSm}>
                {fact.source}
              </a>
            </li>
          ))}
        </ul>
      </details>

      <div className="mt-5 border-t border-dashed border-[var(--sf-ink)]/12 pt-4">
        {mailedAt ? (
          <GardenNotice tone="success" title={`Mailed ${formatDay(mailedAt)}`}>
            {emailDue
              ? `The first email comes due ${formatDay(emailDue)}, once the letter has landed. It mentions the note.`
              : "The email sequence has started."}
          </GardenNotice>
        ) : (
          <LogMailed
            slug={school.demo_slug}
            onLogged={(next) => {
              onOutreach(next);
              adminToast.success(`Letter to ${letter.founder.firstName} logged.`, {
                id: `research-letter-${school.id}`,
                description: "The first email comes due in 5 business days.",
              });
            }}
          />
        )}
      </div>
    </GCard>
  );
}
