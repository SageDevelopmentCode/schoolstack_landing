"use client";

import { useLayoutEffect } from "react";
import type { ParentBillingPageMeta } from "@/lib/tuition/parent-billing-page-meta";
import { useParentBillingPageContext } from "./parent-billing-page-context";

type ParentBillingMetaDataProps = {
  meta: ParentBillingPageMeta;
};

export default function ParentBillingMetaData({ meta }: ParentBillingMetaDataProps) {
  const { hydrateMeta } = useParentBillingPageContext();

  useLayoutEffect(() => {
    hydrateMeta(meta);
  }, [hydrateMeta, meta]);

  return null;
}
