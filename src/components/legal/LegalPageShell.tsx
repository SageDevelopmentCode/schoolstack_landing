import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { Badge } from "@/components/ui/Badge";
import LegalSection from "@/components/legal/LegalSection";
import type { LegalDocument } from "@/content/legal/types";

type LegalPageShellProps = {
  document: LegalDocument;
};

export default function LegalPageShell({ document }: LegalPageShellProps) {
  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen">
        <section className="pt-[140px] pb-20">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-16">
            <Badge>Legal</Badge>
            <h1 className="font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] text-text mt-5 max-w-[720px]">
              {document.title}
            </h1>
            <p className="text-sm font-secondary text-text-faint mt-4">
              Last updated: {document.lastUpdated}
            </p>

            {document.disclaimer ? (
              <p className="mt-6 rounded-2xl border border-clay/20 bg-clay/5 px-5 py-4 text-[14px] font-secondary text-text-muted leading-relaxed max-w-[720px]">
                {document.disclaimer}
              </p>
            ) : null}

            {document.intro ? (
              <p className="text-[17px] font-secondary text-text-muted leading-relaxed mt-8 max-w-[720px]">
                {document.intro}
              </p>
            ) : null}

            <div className="mt-12 max-w-[900px] space-y-10">
              {document.sections.map((section) => (
                <LegalSection key={section.id ?? section.title} section={section} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
