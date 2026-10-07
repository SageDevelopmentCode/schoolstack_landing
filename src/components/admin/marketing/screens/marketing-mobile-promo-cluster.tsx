"use client";

import { MarketingMobileAdminAdmissionsDetailScreen } from "@/components/admin/marketing/screens/mobile/marketing-mobile-admin-admissions-detail";
import { MarketingMobileAdminAdmissionsScreen } from "@/components/admin/marketing/screens/mobile/marketing-mobile-admin-admissions";
import { MarketingMobileAdminTransactionsScreen } from "@/components/admin/marketing/screens/mobile/marketing-mobile-admin-transactions";
import { MarketingMobileParentBillingScreen } from "@/components/admin/marketing/screens/mobile/marketing-mobile-parent-billing";
import { MarketingMobileParentHomeScreen } from "@/components/admin/marketing/screens/mobile/marketing-mobile-parent-home";
import {
  MOBILE_PHONE_HEIGHT,
  MOBILE_PHONE_WIDTH,
  MobilePhoneFrame,
} from "@/components/admin/marketing/screens/mobile-phone-frame";
import type { CSSProperties, ReactNode } from "react";

const SCALE_SIDE = 0.92;
const SCALE_CENTER = 1.02;
const PHONE_GAP = 8;
const VISIBLE_PHONE_FRACTION = 0.92;
/** Vertical nudge from the bottom crop anchor; negative moves phones down (tune in Marketing Studio). */
const CLUSTER_LIFT_PX = -16;

function clusterBottomOffset() {
  return -(MOBILE_PHONE_HEIGHT * SCALE_CENTER * (1 - VISIBLE_PHONE_FRACTION)) + CLUSTER_LIFT_PX;
}

function ClippedPhoneFrame({
  scale,
  children,
  style,
}: {
  scale: number;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const fullWidth = MOBILE_PHONE_WIDTH * scale;
  const visibleHeight = MOBILE_PHONE_HEIGHT * scale * VISIBLE_PHONE_FRACTION;

  return (
    <div style={{ width: fullWidth, height: visibleHeight, overflow: "hidden", flexShrink: 0, ...style }}>
      <MobilePhoneFrame scale={scale}>{children}</MobilePhoneFrame>
    </div>
  );
}

export type MarketingMobilePromoClusterVariant = "tuition" | "admissions";

export function MarketingMobilePromoCluster({
  variant = "tuition",
}: {
  variant?: MarketingMobilePromoClusterVariant;
}) {
  const centerScreen =
    variant === "admissions" ? (
      <MarketingMobileAdminAdmissionsScreen />
    ) : (
      <MarketingMobileParentBillingScreen />
    );
  const rightScreen =
    variant === "admissions" ? (
      <MarketingMobileAdminAdmissionsDetailScreen />
    ) : (
      <MarketingMobileAdminTransactionsScreen />
    );

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: clusterBottomOffset(),
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: PHONE_GAP,
        width: "max-content",
      }}
    >
      <ClippedPhoneFrame scale={SCALE_SIDE} style={{ zIndex: 1 }}>
        <MarketingMobileParentHomeScreen />
      </ClippedPhoneFrame>
      <ClippedPhoneFrame scale={SCALE_CENTER} style={{ zIndex: 3 }}>
        {centerScreen}
      </ClippedPhoneFrame>
      <ClippedPhoneFrame scale={SCALE_SIDE} style={{ zIndex: 2 }}>
        {rightScreen}
      </ClippedPhoneFrame>
    </div>
  );
}
