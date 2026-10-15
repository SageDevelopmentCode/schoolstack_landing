"use client";

import type { ReactNode } from "react";
import {
  BookDemoHashProvider,
  BookDemoHashScroll,
} from "@/lib/marketing/book-demo-hash-context";

export default function TuitionPlannerMarketingBookDemoShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <BookDemoHashProvider>
      <BookDemoHashScroll />
      <div className="bg-bg font-secondary text-text">{children}</div>
    </BookDemoHashProvider>
  );
}
