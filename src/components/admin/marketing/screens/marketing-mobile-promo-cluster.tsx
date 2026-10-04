"use client";

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
/** Raises cluster slightly above pure crop offset (tune in Marketing Studio). */
const CLUSTER_LIFT_PX = 20;

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

export function MarketingMobilePromoCluster() {
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
        <MarketingMobileParentBillingScreen />
      </ClippedPhoneFrame>
      <ClippedPhoneFrame scale={SCALE_SIDE} style={{ zIndex: 2 }}>
        <MarketingMobileAdminTransactionsScreen />
      </ClippedPhoneFrame>
    </div>
  );
}
