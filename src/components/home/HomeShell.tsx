import dynamic from "next/dynamic";
import HomePageMain from "@/components/sections/HomePageMain";
import SectionFallback from "@/components/ui/SectionFallback";
import { InViewSectionGate } from "@/components/ui/InViewSectionGate";
import BrightNavbar from "./BrightNavbar";

const Footer = dynamic(() => import("@/components/sections/Footer"), {
  loading: () => <SectionFallback minHeight="12rem" />,
});
const FloatingQuestionButton = dynamic(
  () => import("@/components/sections/FloatingQuestionButton"),
  { loading: () => null },
);

export default function HomeShell({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <link rel="preload" as="image" href="/images/Logo.webp" fetchPriority="high" />
      <BrightNavbar />
      <HomePageMain>{children}</HomePageMain>
      <InViewSectionGate minHeight="12rem">
        <Footer />
      </InViewSectionGate>
      <FloatingQuestionButton />
    </div>
  );
}
