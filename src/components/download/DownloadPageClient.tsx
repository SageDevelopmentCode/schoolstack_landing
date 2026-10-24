"use client";

import DownloadCtaBand from "@/components/download/DownloadCtaBand";
import DownloadHeroSection from "@/components/download/DownloadHeroSection";
import DownloadInsideSection from "@/components/download/DownloadInsideSection";

export default function DownloadPageClient() {
  return (
    <>
      <DownloadHeroSection />
      <DownloadInsideSection />
      <DownloadCtaBand />
    </>
  );
}
