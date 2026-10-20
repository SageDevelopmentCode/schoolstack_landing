import FreeToolsHero from "@/components/marketing/free-tools/FreeToolsHero";
import FreeToolsGrid from "@/components/marketing/free-tools/FreeToolsGrid";
import FreeToolsFaqSection from "@/components/marketing/free-tools/FreeToolsFaqSection";
import FreeToolsProductCta from "@/components/marketing/free-tools/FreeToolsProductCta";

export default function FreeToolsHubClient() {
  return (
    <>
      <section className="pb-8">
        <FreeToolsHero />
      </section>

      <section id="tools" className="scroll-mt-24">
        <FreeToolsGrid />
      </section>

      <FreeToolsFaqSection />
      <FreeToolsProductCta />
    </>
  );
}
