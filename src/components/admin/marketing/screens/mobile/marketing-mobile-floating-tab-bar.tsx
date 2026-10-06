import {
  Calendar,
  CreditCard,
  Ellipsis,
  FileText,
  Home,
  LayoutGrid,
  MessageCircle,
  MoreHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";
import { MARKETING_MOBILE_THEME } from "@/components/admin/marketing/screens/mobile/marketing-mobile-theme";

const T = MARKETING_MOBILE_THEME;

export type MarketingParentTabId = "home" | "billing" | "messages" | "calendar" | "more";

const PARENT_TABS: { id: MarketingParentTabId; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "more", label: "More", icon: Ellipsis },
];

export type MarketingSchoolAdminTabId = "dashboard" | "admissions" | "students" | "messages" | "more";

const ADMIN_TABS: { id: MarketingSchoolAdminTabId; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "admissions", label: "Admissions", icon: FileText },
  { id: "students", label: "Students", icon: Users },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "more", label: "More", icon: MoreHorizontal },
];

const TAB_ROW_HEIGHT = 56;
const TAB_CHROME_PADDING_TOP = 10;
const TAB_CHROME_PADDING_BOTTOM = 8;

export const MARKETING_MOBILE_TAB_CHROME_HEIGHT = TAB_CHROME_PADDING_TOP + TAB_ROW_HEIGHT + TAB_CHROME_PADDING_BOTTOM;

/** Content padding above floating tab chrome (matches chrome height + small gap). */
export const MARKETING_MOBILE_TAB_BAR_INSET = MARKETING_MOBILE_TAB_CHROME_HEIGHT + 10;

function FloatingTabBarInner<T extends string>({
  tabs,
  activeTab,
}: {
  tabs: { id: T; label: string; icon: LucideIcon }[];
  activeTab: T;
}) {
  return (
    <div
      style={{
        pointerEvents: "none",
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
        padding: `${TAB_CHROME_PADDING_TOP}px 12px ${TAB_CHROME_PADDING_BOTTOM}px`,
        boxSizing: "border-box",
        backgroundColor: T.paper,
        boxShadow: "0 -4px 12px rgba(43, 36, 29, 0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          maxWidth: 400,
          margin: "0 auto",
          gap: 4,
          minHeight: TAB_ROW_HEIGHT,
          alignItems: "stretch",
        }}
      >
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <div
              key={tab.id}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                padding: "6px 2px",
                borderRadius: 10,
                background: active ? T.soft : "transparent",
              }}
            >
              <Icon size={19} strokeWidth={active ? 2.4 : 2} color={active ? T.primary : T.muted} />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: active ? T.primary : T.muted,
                  textAlign: "center",
                }}
              >
                {tab.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MarketingParentTabBar({ activeTab }: { activeTab: MarketingParentTabId }) {
  return <FloatingTabBarInner tabs={PARENT_TABS} activeTab={activeTab} />;
}

export function MarketingSchoolAdminTabBar({ activeTab }: { activeTab: MarketingSchoolAdminTabId }) {
  return <FloatingTabBarInner tabs={ADMIN_TABS} activeTab={activeTab} />;
}
