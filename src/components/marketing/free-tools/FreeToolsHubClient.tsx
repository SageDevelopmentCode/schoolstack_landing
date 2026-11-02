import FreeToolsHero from "@/components/marketing/free-tools/FreeToolsHero";
import FreeToolsHubToolsPanel from "@/components/marketing/free-tools/FreeToolsHubToolsPanel";
import FreeToolsProductCta from "@/components/marketing/free-tools/FreeToolsProductCta";

export default function FreeToolsHubClient() {
  return (
    <>
      <section className="pb-8">
        <FreeToolsHero />
      </section>

      <section id="tools" className="scroll-mt-24">
        <FreeToolsHubToolsPanel />
      </section>

      <FreeToolsProductCta />
    </>
  );
}
