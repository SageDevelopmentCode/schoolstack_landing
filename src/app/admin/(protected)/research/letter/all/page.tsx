import Link from "next/link";
import { LetterBulkPrintSheets } from "@/components/admin/research/LetterBulkPrintSheets";
import { PrintButton } from "@/components/admin/research/PrintButton";
import { loadLetterBulkCards } from "@/lib/admin-crm/letter-bulk-cards";

export const metadata = { title: "All letter QR cards", robots: { index: false, follow: false } };

/** Every school's letter QR card, four to a US Letter sheet, for one print run (/admin/research → Print all QR cards). */
export default async function AllLetterCardsPage({ searchParams }: { searchParams: Promise<{ skip?: string }> }) {
  const { skip } = await searchParams;
  const cards = await loadLetterBulkCards();
  const initialSkip = (skip ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 print:m-0 print:max-w-none print:space-y-0 print:p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <p className="m-0 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft,#6b6158)]">Letter QR cards</p>
          <h1 className="m-0 text-2xl font-extrabold">All letter QR cards</h1>
          <p className="m-0 mt-1 max-w-2xl text-sm text-[#6b6158]">
            One card per school with a letter, four to a sheet. Print on card stock at 100% scale with margins set to none, then cut
            each sheet into quarters on the dashed lines. Untick any school you&rsquo;ve already mailed. New letters show up here on
            their own.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/research"
            className="inline-flex items-center rounded-full border-2 border-[#2b241d] px-4 py-2 text-sm font-extrabold"
          >
            Back to outreach
          </Link>
          <PrintButton className="inline-flex items-center gap-2 rounded-full border-2 border-[#2b241d] bg-[#2b241d] px-4 py-2 text-sm font-extrabold text-white" />
        </div>
      </div>
      {cards.length === 0 ? (
        <p className="m-0 text-sm text-[#6b6158]">No schools have a letter yet.</p>
      ) : (
        <LetterBulkPrintSheets cards={cards} initialSkip={initialSkip} />
      )}
    </div>
  );
}
