import { HOME_FAQ } from "@/lib/faq";
import { COMPARE_PATH, COMPARE_RIVAL_IDS, comparePath, compareSummary, rivalComparison } from "@/lib/marketing/compare";
import { FEATURES } from "@/lib/marketing/features";
import { FEATURES_PATH, featurePath } from "@/lib/marketing/features/paths";
import { MARKETING_FREE_TOOLS } from "@/lib/marketing/free-tools";
import { ENTITY_DISAMBIGUATION, ENTITY_SUMMARY, FOUNDERS, MUDKITCHEN_CONTACT, SITE_NAME, SITE_URL } from "@/lib/site";

type Link = { title: string; path: string; description?: string };

function linkLine({ title, path, description }: Link) {
  return `- [${title}](${SITE_URL}${path})${description ? `: ${description}` : ""}`;
}

function section(heading: string, links: Link[]) {
  return [`## ${heading}`, "", ...links.map(linkLine)].join("\n");
}

/**
 * /llms.txt (llmstxt.org format): a plain-text map of the public site for AI assistants.
 * Built from the same data as the pages, so it never drifts from what the site says.
 */
export function buildLlmsTxt({ blogPosts = [] }: { blogPosts?: { slug: string; title: string }[] } = {}) {
  const founders = FOUNDERS.map((f) => f.name).join(" and ");
  const intro = [
    `# ${SITE_NAME}`,
    "",
    `> ${ENTITY_SUMMARY}`,
    "",
    ENTITY_DISAMBIGUATION,
    "",
    `${SITE_NAME} was built by ${founders} while opening Sage Field, a private microschool in Round Rock, Texas. ` +
      "It brings a school website, admissions, tuition billing and autopay, parent messages, attendance, staff hours, " +
      "student records, forms and a parent and staff mobile app (iPhone and Android) into one system.",
    "",
    `Contact: ${MUDKITCHEN_CONTACT.email}. Book a demo: ${SITE_URL}/get-started`,
  ].join("\n");

  const product: Link[] = [
    { title: "Home", path: "/", description: "What MudKitchen is and who it's for" },
    { title: "All features", path: FEATURES_PATH, description: "Every feature, by role (admins, families, staff)" },
    ...FEATURES.map((f) => ({ title: f.name, path: featurePath(f.slug), description: f.oneLiner })),
  ];

  const compare: Link[] = [
    { title: "Microschool software compared", path: COMPARE_PATH },
    ...COMPARE_RIVAL_IDS.map((id) => {
      const comparison = rivalComparison(id);
      return { title: `MudKitchen vs ${comparison.rival.name}`, path: comparePath(id), description: compareSummary(comparison) };
    }),
  ];

  const tools: Link[] = MARKETING_FREE_TOOLS.map((t) => ({ title: t.title, path: t.href, description: t.description }));

  const company: Link[] = [
    { title: "About the founders", path: "/about" },
    { title: "Sage Field case study", path: "/customers/sagefield", description: "How a new microschool grew from 0 to 35 students in under 3 months on MudKitchen" },
    { title: "Book a demo", path: "/get-started" },
    { title: "Support", path: "/support" },
    { title: "Privacy policy", path: "/privacy" },
  ];

  const faq = ["## FAQ", "", ...HOME_FAQ.flatMap((f) => [`### ${f.question}`, "", f.answer, ""])].join("\n").trimEnd();

  return [
    intro,
    section("Product", product),
    section("Comparisons", compare),
    section("Free tools for microschool founders", tools),
    ...(blogPosts.length ? [section("Blog", blogPosts.map((p) => ({ title: p.title, path: `/blog/${p.slug}` })))] : []),
    section("Company", company),
    faq,
  ].join("\n\n") + "\n";
}
