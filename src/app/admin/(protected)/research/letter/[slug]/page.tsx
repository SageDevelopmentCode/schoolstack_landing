import Link from "next/link";
import { notFound } from "next/navigation";
import { LetterPrintSheet } from "@/components/admin/research/LetterPrintSheet";
import { PrintButton } from "@/components/admin/research/PrintButton";
import { getOutreachPlan } from "@/data/outreach";
import { letterQrSvg } from "@/lib/admin-crm/letter-qr";
import { letterShortUrl, letterShortUrlLabel } from "@/lib/admin-crm/outreach-letter";
import { PRODUCTION_SITE_URL } from "@/lib/site";

export const metadata = { title: "Letter QR card", robots: { index: false, follow: false } };

/** Printable QR insert card for a school's handwritten letter (/admin/research → Print QR card). */
export default async function LetterCardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plan = getOutreachPlan(slug);
  if (!plan?.letter || !plan.snapshot) notFound();

  const url = letterShortUrl(plan.letter.shortCode, PRODUCTION_SITE_URL);
  const qrSvg = await letterQrSvg(url);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <p className="m-0 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft,#6b6158)]">Letter QR card</p>
          <h1 className="m-0 text-2xl font-extrabold">{plan.schoolName}</h1>
          <p className="m-0 mt-1 text-sm text-[#6b6158]">
            Print on card stock at 100% scale, cut on the dashed lines, and tuck one in with the letter. The code opens{" "}
            <a className="underline" href={url} target="_blank" rel="noreferrer">
              {letterShortUrlLabel(plan.letter.shortCode, PRODUCTION_SITE_URL)}
            </a>
            , which goes to their snapshot (and from there their demo). Scans ping Discord as &ldquo;Letter QR scanned&rdquo;.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/research?demo=${encodeURIComponent(slug)}`}
            className="inline-flex items-center rounded-full border-2 border-[#2b241d] px-4 py-2 text-sm font-extrabold"
          >
            Back to outreach
          </Link>
          <PrintButton className="inline-flex items-center gap-2 rounded-full border-2 border-[#2b241d] bg-[#2b241d] px-4 py-2 text-sm font-extrabold text-white" />
        </div>
      </div>
      <LetterPrintSheet
        letter={plan.letter}
        schoolShortName={plan.letter.shortSchoolName}
        qrSvg={qrSvg}
        shortUrlLabel={letterShortUrlLabel(plan.letter.shortCode, PRODUCTION_SITE_URL)}
      />
    </div>
  );
}
