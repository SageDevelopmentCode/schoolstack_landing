"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { DARK_PILL } from "@/components/home/bright-styles";

export default function SagefieldStickyRail() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed right-6 top-1/2 z-40 hidden w-[176px] -translate-y-1/2 flex-col gap-3 2xl:flex"
          aria-label="Key results"
        >
          <div className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F4F1EC]">
                <TrendingUp size={13} className="text-clay" />
              </div>
              <span className="font-secondary text-[10px] font-semibold uppercase tracking-widest text-[#1d1a16]/50">
                Sage Field
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="rounded-lg border border-black/8 bg-[#F4F1EC] px-3 py-2.5 text-center">
                <div className="font-secondary text-[1.5rem] font-bold leading-none tracking-[-0.03em] text-[#1d1a16]">
                  0→35
                </div>
                <div className="mt-1 font-secondary text-[11px] leading-snug text-[#1d1a16]/50">
                  students in &lt;3 months
                </div>
              </div>
              <div className="rounded-lg border border-black/8 bg-[#F4F1EC] px-3 py-2.5">
                <div className="mb-1.5 font-secondary text-[10px] font-semibold uppercase tracking-widest text-[#1d1a16]/50">
                  Platform covered
                </div>
                {["Website", "Enrollment", "Tuition", "Ops"].map((item) => (
                  <div key={item} className="mb-1 flex items-center gap-1.5 last:mb-0">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                    <span className="font-secondary text-[12px] text-[#1d1a16]/70">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <a href={BOOK_DEMO_HASH_HREF} className={`${DARK_PILL} h-9 w-full justify-center text-[12px]`}>
              Book a demo
              <ArrowRight size={12} aria-hidden />
            </a>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
