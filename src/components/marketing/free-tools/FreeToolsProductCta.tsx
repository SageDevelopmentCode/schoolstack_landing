import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BOOK_DEMO_HREF } from "@/lib/marketing/book-demo";

export default function FreeToolsProductCta() {
  return (
    <section className="mt-12 rounded-[40px] bg-[#1d1a16] px-6 py-10 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-10">
      <div>
        <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">
          When you&apos;re ready for the school day
        </p>
        <h2 className="font-secondary! mt-2 text-[clamp(1.4rem,3vw,1.6rem)] font-bold! leading-[1.06]! tracking-[-0.04em]! text-white">
          Planning is one part. Running school is the rest.
        </h2>
        <p className="mt-2 max-w-[720px] font-secondary text-[15px] leading-relaxed text-white/65">
          Explore how MudKitchen brings enrollment, tuition, family communication, and school
          operations into a shared workspace.
        </p>
      </div>
      <Link
        href={BOOK_DEMO_HREF}
        className="font-secondary mt-6 inline-flex h-12 shrink-0 items-center gap-2 rounded-pill bg-white px-7 text-[15px] font-semibold text-[#1d1a16] transition-colors hover:bg-[#F8DDCF] sm:mt-0"
      >
        See MudKitchen
        <ArrowRight size={16} aria-hidden />
      </Link>
    </section>
  );
}
