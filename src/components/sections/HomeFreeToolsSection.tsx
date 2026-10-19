import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FreeToolsGrid from "@/components/marketing/free-tools/FreeToolsGrid";
import FreeToolsHero from "@/components/marketing/free-tools/FreeToolsHero";
import {
  freeToolsStorySurfaceClassName,
  freeToolsStorySurfaceStyle,
} from "@/components/marketing/free-tools/free-tools-story-surface";
import { FREE_TOOLS_HUB_THEME } from "@/components/marketing/free-tools/free-tools-hub-theme";
import { FREE_TOOLS_HUB_PATH } from "@/lib/marketing/free-tools";

const theme = FREE_TOOLS_HUB_THEME;

export default function HomeFreeToolsSection() {
  return (
    <section
      id="free-tools"
      className={`${freeToolsStorySurfaceClassName} overflow-x-clip py-24`}
      style={freeToolsStorySurfaceStyle()}
      aria-labelledby="home-free-tools-heading"
    >
      <div className="mx-auto min-w-0 max-w-[1180px] px-6 lg:px-16">
        <header className="mb-10 max-w-[640px]">
          <FreeToolsHero headingAs="h2" headingId="home-free-tools-heading" />
        </header>

        <FreeToolsGrid />

        <p className="mt-8 text-center">
          <Link
            href={FREE_TOOLS_HUB_PATH}
            className="inline-flex items-center gap-1.5 text-[13px] font-bold transition-opacity hover:opacity-80"
            style={{ color: theme.primary, fontFamily: theme.fontBody }}
          >
            Explore all free tools
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  );
}
