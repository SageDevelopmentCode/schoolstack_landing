"use client";

import type { ReactNode } from "react";
import {
  BookDemoHashProvider,
  BookDemoHashScroll,
} from "@/lib/marketing/book-demo-hash-context";

export default function HomePageMain({ children }: { children: ReactNode }) {
  return (
    <BookDemoHashProvider>
      <BookDemoHashScroll />
      <main>{children}</main>
    </BookDemoHashProvider>
  );
}
