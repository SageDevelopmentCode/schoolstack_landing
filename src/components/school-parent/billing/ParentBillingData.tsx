"use client";

import { useLayoutEffect } from "react";
import type { ParentBillingInitialData } from "@/lib/tuition/load-parent-billing-data";
import { useParentBillingPageContext } from "./parent-billing-page-context";

type ParentBillingDataProps = {
  billingData: ParentBillingInitialData;
};

export default function ParentBillingData({ billingData }: ParentBillingDataProps) {
  const { hydrateBillingData } = useParentBillingPageContext();

  useLayoutEffect(() => {
    hydrateBillingData(billingData);
  }, [billingData, hydrateBillingData]);

  return null;
}
