import { Badge } from "@/components/ui/Badge";
import { FadeInView } from "@/components/ui/FadeInView";
import FreeToolsGrid from "@/components/marketing/free-tools/FreeToolsGrid";

export default function FreeToolsHubPage() {
  return (
    <main className="bg-bg min-h-screen">
      <section className="pt-[140px] pb-12">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-16">
          <FadeInView>
            <Badge>Free tools</Badge>
          </FadeInView>
          <FadeInView delay={0.08}>
            <h1 className="font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] text-text mt-5 max-w-[720px]">
              Plan your school with{" "}
              <em style={{ color: "#A05C45", fontStyle: "italic" }}>
                free calculators
              </em>{" "}
              and checklists
            </h1>
          </FadeInView>
          <FadeInView delay={0.14}>
            <p className="text-[17px] font-secondary text-text-muted leading-relaxed mt-5 max-w-[560px]">
              Built for microschool founders — enrollment math, tuition scenarios,
              and a quick operations check. No signup required.
            </p>
          </FadeInView>
        </div>
      </section>

      <section className="pb-32">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-16">
          <FreeToolsGrid />
        </div>
      </section>
    </main>
  );
}
