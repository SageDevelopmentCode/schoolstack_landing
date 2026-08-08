"use client";

import dynamic from "next/dynamic";

/** Code-split ParentDashboardDemo out of school admin demo bundles. */
const ParentDashboardDemo = dynamic(
  () => import("@/components/sections/ParentDashboardDemo"),
  { ssr: false },
);

export default ParentDashboardDemo;
