"use client";

import SectionFallback from "@/components/ui/SectionFallback";
import { useInViewOnRestore } from "@/hooks/useInViewOnRestore";
import { useHydrated } from "@/hooks/useHydrated";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";

interface InViewSectionGateProps {
  children: React.ReactNode;
  minHeight?: string;
  className?: string;
}

export function InViewSectionGate({
  children,
  minHeight = "24rem",
  className = "",
}: InViewSectionGateProps) {
  const hydrated = useHydrated();
  const { skip } = useEntranceAnimation();
  const [ref, inView] = useInViewOnRestore<HTMLDivElement>({
    threshold: 0,
    rootMargin: "200px 0px 200px 0px",
  });

  const show = hydrated && (inView || skip);

  return (
    <div ref={ref} className={className}>
      {show ? children : <SectionFallback minHeight={minHeight} />}
    </div>
  );
}
