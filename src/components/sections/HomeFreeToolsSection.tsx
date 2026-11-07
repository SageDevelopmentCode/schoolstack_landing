import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FreeToolsGrid from "@/components/marketing/free-tools/FreeToolsGrid";
import FreeToolsHero from "@/components/marketing/free-tools/FreeToolsHero";
import { FREE_TOOLS_HUB_PATH } from "@/lib/marketing/free-tools";

export default function HomeFreeToolsSection() {
  return (
    <section
      id="free-tools"
      className="overflow-x-clip bg-white px-3 py-12 lg:px-6 lg:py-16"
      aria-labelledby="home-free-tools-heading"
    >
      <div className="mx-auto max-w-[1400px] rounded-[40px] bg-[#EEF3EC] px-6 py-14 md:px-10 lg:px-14 lg:py-16">
        <header className="mb-10 max-w-[640px]">
          <FreeToolsHero headingAs="h2" headingId="home-free-tools-heading" />
        </header>

        <FreeToolsGrid />

        <p className="mt-8 text-center">
          <Link
            href={FREE_TOOLS_HUB_PATH}
            className="font-secondary inline-flex items-center gap-1.5 text-[14px] font-semibold text-clay transition-colors hover:text-[#1d1a16]"
          >
            Explore all free tools
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  );
}
