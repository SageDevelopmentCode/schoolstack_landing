import type { FaqItem } from "@/lib/faq";
import { FEATURES } from "@/lib/marketing/features";
import { featurePath } from "@/lib/marketing/features/paths";
import { COMPARISONS_CHECKED, RIVALS, type Rival } from "@/lib/marketing/features/rivals";
import type { CompareCell, FeatureSlug, RivalId } from "@/lib/marketing/features/types";

/*
 * MudKitchen vs one rival, across every feature page's comparison table. Nothing here is
 * written by hand: rows, marks and sources come from the feature content files
 * (src/lib/marketing/features/*.ts), so these pages stay in step with the feature pages.
 */

export const COMPARE_PATH = "/compare";

export function comparePath(rival: RivalId) {
  return `${COMPARE_PATH}/${rival}`;
}

export const COMPARE_RIVAL_IDS: RivalId[] = RIVALS.map((r) => r.id);

export function getRival(id: string): Rival | undefined {
  return RIVALS.find((r) => r.id === id);
}

export type RivalCompareRow = {
  label: string;
  mudkitchen: CompareCell;
  rival: CompareCell;
};

export type RivalCompareSection = {
  feature: { slug: FeatureSlug; name: string; path: string };
  rows: RivalCompareRow[];
};

export type RivalTally = { yes: number; partial: number; no: number; unknown: number; total: number };

export type RivalComparison = {
  rival: Rival;
  sections: RivalCompareSection[];
  /** Capabilities MudKitchen has (ticked rows only; plain text rows like "Built for" are left out). */
  tally: RivalTally;
  /** Rows where the rival only partly has it or doesn't: the real differences. */
  differences: (RivalCompareRow & { feature: string })[];
  checked: string;
};

/** Same rule as the feature pages' table: only rows where MudKitchen has the capability. */
function mudkitchenHasIt(cell: CompareCell) {
  return cell.mark === undefined || cell.mark === "yes";
}

export function rivalComparison(id: RivalId): RivalComparison {
  const rival = getRival(id);
  if (!rival) throw new Error(`Unknown rival: ${id}`);

  const sections: RivalCompareSection[] = [];
  const tally: RivalTally = { yes: 0, partial: 0, no: 0, unknown: 0, total: 0 };
  const differences: RivalComparison["differences"] = [];

  for (const feature of FEATURES) {
    const rows = feature.comparison
      .filter((row) => mudkitchenHasIt(row.mudkitchen))
      .map((row) => ({ label: row.label, mudkitchen: row.mudkitchen, rival: row.rivals[id] }));
    if (!rows.length) continue;
    sections.push({ feature: { slug: feature.slug, name: feature.name, path: featurePath(feature.slug) }, rows });

    for (const row of rows) {
      if (row.mudkitchen.mark !== "yes") continue;
      const mark = row.rival.mark ?? "unknown";
      tally[mark] += 1;
      tally.total += 1;
      if (mark === "partial" || mark === "no") differences.push({ ...row, feature: feature.name });
    }
  }

  return { rival, sections, tally, differences, checked: COMPARISONS_CHECKED };
}

/** The answer-first paragraph at the top of a comparison page (and in llms.txt). */
export function compareSummary({ rival, tally, checked }: RivalComparison): string {
  return (
    `${rival.name} is built for ${rival.builtFor.toLowerCase()}; MudKitchen is built for microschools and small private schools. ` +
    `We compared ${tally.total} capabilities a microschool uses against ${rival.name}'s own public pages (checked ${checked}). ` +
    `${rival.name} clearly offers ${tally.yes}, partly offers ${tally.partial}, doesn't offer ${tally.no}, ` +
    `and we couldn't confirm ${tally.unknown} from public information.`
  );
}

export function compareFaq(comparison: RivalComparison): FaqItem[] {
  const { rival, checked } = comparison;
  return [
    {
      question: `Who is ${rival.name} built for?`,
      answer: `${rival.name} describes itself as built for ${rival.builtFor.toLowerCase()}. MudKitchen is built for microschools and small private schools: enrollment, tuition billing, parent communication and daily operations in one system, built inside a real microschool.`,
    },
    {
      question: `How does MudKitchen compare with ${rival.name} for a microschool?`,
      answer: compareSummary(comparison),
    },
    {
      question: "How was this comparison made?",
      answer: `We read ${rival.name}'s own public website and help pages in ${checked}. Every claim about ${rival.name} links to the page it came from. Where we couldn't confirm a capability from public information, the table says "Unconfirmed" rather than guessing. Details can change, so follow the links to confirm.`,
    },
  ];
}
