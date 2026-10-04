"use client";

import { MobilePhoneFrame } from "@/components/admin/marketing/screens/mobile-phone-frame";
import { MarketingMobileAdminTransactionsScreen } from "@/components/admin/marketing/screens/mobile/marketing-mobile-admin-transactions";
import { MarketingMobileParentBillingScreen } from "@/components/admin/marketing/screens/mobile/marketing-mobile-parent-billing";
import { MarketingMobileParentHomeScreen } from "@/components/admin/marketing/screens/mobile/marketing-mobile-parent-home";

const SCALE_SIDE = 0.64;
const SCALE_CENTER = 0.72;
const PHONE_OVERLAP = 64;

export function MarketingMobilePromoCluster() {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: 0,
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        width: "max-content",
        paddingBottom: 8,
      }}
    >
      <MobilePhoneFrame scale={SCALE_SIDE} style={{ marginRight: -PHONE_OVERLAP, zIndex: 1 }}>
        <MarketingMobileParentHomeScreen />
      </MobilePhoneFrame>
      <MobilePhoneFrame scale={SCALE_CENTER} style={{ zIndex: 3 }}>
        <MarketingMobileParentBillingScreen />
      </MobilePhoneFrame>
      <MobilePhoneFrame scale={SCALE_SIDE} style={{ marginLeft: -PHONE_OVERLAP, zIndex: 2 }}>
        <MarketingMobileAdminTransactionsScreen />
      </MobilePhoneFrame>
    </div>
  );
}
