"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  MessageSquare,
  CalendarDays,
  DollarSign,
  School,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";

type ActivePage =
  | "dashboard"
  | "leads"
  | "people"
  | "programs"
  | "messages"
  | "calendar"
  | "budget"
  | "myschool";

type NavItem = {
  key: ActivePage;
  name: string;
  icon: React.ReactNode;
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Main",
    items: [
      {
        key: "dashboard",
        name: "Dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        key: "leads",
        name: "Admissions",
        icon: <GraduationCap className="w-4 h-4" />,
      },
      {
        key: "people",
        name: "People",
        icon: <Users className="w-4 h-4" />,
      },
      {
        key: "programs",
        name: "Programs",
        icon: <BookOpen className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        key: "messages",
        name: "Messages",
        icon: <MessageSquare className="w-4 h-4" />,
      },
      {
        key: "calendar",
        name: "Calendar",
        icon: <CalendarDays className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "Finances",
    items: [
      {
        key: "budget",
        name: "Finances",
        icon: <DollarSign className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "School",
    items: [
      {
        key: "myschool",
        name: "My School",
        icon: <School className="w-4 h-4" />,
      },
    ],
  },
];

const PAGE_LABELS: Record<ActivePage, string> = {
  dashboard: "Dashboard",
  leads: "Admissions",
  people: "People",
  programs: "Programs",
  messages: "Messages",
  calendar: "Calendar",
  budget: "Finances",
  myschool: "My School",
};

type SchoolAdminBaselineProps = {
  schoolName: string;
  branding: OrganizationBranding;
  features?: OrganizationFeatures;
};

function StatCard({
  C,
  title,
  value,
  delta,
  deltaPositive,
  icon,
  delay = 0,
}: {
  C: AdminThemeTokens;
  title: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  icon?: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="relative overflow-hidden"
      style={{
        backgroundColor: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: C.r.lg,
        padding: "18px",
        boxShadow: C.shadowCard,
      }}
    >
      {icon && (
        <div
          className="absolute top-3 right-3 w-7 h-7 rounded-sm flex items-center justify-center"
          style={{ backgroundColor: C.accentGlow }}
        >
          <span style={{ color: C.accent }}>{icon}</span>
        </div>
      )}
      <p
        className="text-xs font-medium mb-2"
        style={{ color: C.textTertiary }}
      >
        {title}
      </p>
      <p
        className="text-2xl font-semibold tabular-nums tracking-tight"
        style={{ color: C.textPrimary }}
      >
        {value}
      </p>
      {delta && (
        <p
          className="text-xs mt-1.5 font-medium"
          style={{
            color: deltaPositive ? C.success : C.textTertiary,
          }}
        >
          {delta}
        </p>
      )}
    </motion.div>
  );
}

function DashboardPage({
  C,
  schoolName,
}: {
  C: AdminThemeTokens;
  schoolName: string;
}) {
  const kpis = [
    {
      title: "Enrolled",
      value: "24",
      delta: "+4 this cycle",
      pos: true,
      icon: <Users className="w-4 h-4" />,
    },
    {
      title: "Active Leads",
      value: "37",
      delta: "+12 this month",
      pos: true,
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      title: "In Review",
      value: "8",
      delta: "Applications",
      pos: false,
      icon: <ClipboardList className="w-4 h-4" />,
    },
    {
      title: "Programs",
      value: "3",
      delta: "Active this year",
      pos: true,
      icon: <BookOpen className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3 mb-5">
        <h1
          className="text-xl font-semibold tracking-tight flex items-center gap-2"
          style={{ color: C.textPrimary }}
        >
          <span className="text-lg leading-none">📊</span>
          Dashboard
        </h1>
        <p className="text-sm" style={{ color: C.textTertiary }}>
          {schoolName}
        </p>
        <div
          className="text-sm rounded-md px-3 py-2"
          style={{
            backgroundColor: C.accentLight,
            border: `1px solid ${C.secondaryBtnBorder}`,
            color: C.textSecondary,
          }}
        >
          Welcome to your admin dashboard. This is a preview — full features
          are coming soon.
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <StatCard
            key={kpi.title}
            C={C}
            title={kpi.title}
            value={kpi.value}
            delta={kpi.delta}
            deltaPositive={kpi.pos}
            icon={kpi.icon}
            delay={i * 0.05}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: C.r.lg,
          padding: "24px",
          boxShadow: C.shadowCard,
        }}
      >
        <h2
          className="text-sm font-semibold mb-2"
          style={{ color: C.textPrimary }}
        >
          Getting started
        </h2>
        <p className="text-sm" style={{ color: C.textSecondary }}>
          Your school&apos;s branding is loaded from organization settings.
          Admissions, people, programs, and finances will connect here as we
          build out the product.
        </p>
      </motion.div>
    </div>
  );
}

function ComingSoonPage({
  C,
  pageName,
}: {
  C: AdminThemeTokens;
  pageName: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center px-6">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
        style={{ backgroundColor: C.accentGlow }}
      >
        <School className="w-6 h-6" style={{ color: C.accent }} />
      </div>
      <h2
        className="text-lg font-semibold mb-2"
        style={{ color: C.textPrimary }}
      >
        {pageName}
      </h2>
      <p className="text-sm max-w-sm" style={{ color: C.textSecondary }}>
        This section is coming soon. Check back as we roll out more admin
        features for your school.
      </p>
    </div>
  );
}

function Sidebar({
  C,
  branding,
  activePage,
  onNavigate,
  isExpanded,
  onToggleExpand,
}: {
  C: AdminThemeTokens;
  branding: OrganizationBranding;
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const { logo } = branding;

  return (
    <motion.aside
      animate={{ width: isExpanded ? 185 : 52 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col h-full flex-shrink-0 overflow-hidden"
      style={{
        backgroundColor: C.surface,
        borderRight: `1px solid ${C.border}`,
        zIndex: 1,
        position: "relative",
      }}
    >
      <div
        className="flex items-center overflow-hidden"
        style={{
          padding: isExpanded ? "14px 16px" : "14px 0",
          justifyContent: isExpanded ? "flex-start" : "center",
        }}
      >
        <Image
          src={logo.src}
          alt={logo.alt}
          width={isExpanded ? (logo.width ?? 160) : 36}
          height={logo.height ?? 40}
          className="flex-shrink-0 object-contain"
          style={{ maxHeight: 40 }}
        />
      </div>

      <div
        style={{
          borderBottom: `1px solid ${C.border}`,
          padding: isExpanded ? "0 10px 10px" : "0 6px 10px",
        }}
      >
        <button
          type="button"
          title="Need help?"
          className="w-full flex items-center transition-colors duration-150"
          style={{
            justifyContent: isExpanded ? "flex-start" : "center",
            gap: isExpanded ? "8px" : 0,
            padding: "6px 8px",
            borderRadius: C.r.sm,
            border: `1px solid ${C.clayBorder}`,
            backgroundColor: C.clayBg,
            color: C.textSecondary,
            cursor: "pointer",
          }}
        >
          <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {isExpanded && (
            <span className="text-sm font-medium">Need help?</span>
          )}
        </button>
      </div>

      <nav
        className="flex-1 overflow-y-auto space-y-5"
        style={{ padding: isExpanded ? "16px 12px" : "16px 6px" }}
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {isExpanded && (
              <div
                className="text-xs font-medium px-3 mb-1.5"
                style={{ color: C.textQuaternary }}
              >
                {group.label}
              </div>
            )}
            {!isExpanded && group.label !== "Main" && (
              <div
                style={{
                  height: "1px",
                  backgroundColor: C.border,
                  margin: "0 6px 8px",
                }}
              />
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = activePage === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onNavigate(item.key)}
                    title={item.name}
                    className="w-full flex items-center transition-colors duration-150"
                    style={{
                      justifyContent: isExpanded ? "flex-start" : "center",
                      gap: isExpanded ? "8px" : 0,
                      padding: isExpanded ? "7px 10px" : "7px 0",
                      borderRadius: C.r.sm,
                      backgroundColor: active ? C.accentLight : "transparent",
                      border: active
                        ? `1px solid ${C.secondaryBtnBorder}`
                        : "1px solid transparent",
                      color: active ? C.accent : C.textSecondary,
                      cursor: "pointer",
                    }}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {isExpanded && (
                      <span className="text-sm font-medium truncate">
                        {item.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: isExpanded ? "10px 12px" : "10px 6px",
        }}
      >
        <button
          type="button"
          onClick={onToggleExpand}
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          className="w-full flex items-center transition-colors duration-150"
          style={{
            justifyContent: isExpanded ? "flex-start" : "center",
            gap: isExpanded ? "8px" : 0,
            padding: "6px 8px",
            borderRadius: C.r.sm,
            color: C.textTertiary,
            cursor: "pointer",
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          {isExpanded ? (
            <PanelLeftClose className="w-4 h-4 flex-shrink-0" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 flex-shrink-0" />
          )}
          {isExpanded && (
            <span className="text-xs font-medium">Collapse</span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

export default function SchoolAdminBaseline({
  schoolName,
  branding,
}: SchoolAdminBaselineProps) {
  const [activePage, setActivePage] = useState<ActivePage>("dashboard");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  const bodyFont =
    branding.typography.bodyFont?.trim() || "Inter, system-ui, sans-serif";

  function renderPage() {
    if (activePage === "dashboard") {
      return <DashboardPage C={C} schoolName={schoolName} />;
    }
    return (
      <ComingSoonPage C={C} pageName={PAGE_LABELS[activePage]} />
    );
  }

  return (
    <div
      className="flex h-dvh w-full overflow-hidden"
      style={{ backgroundColor: C.bg, fontFamily: bodyFont }}
    >
      <Sidebar
        C={C}
        branding={branding}
        activePage={activePage}
        onNavigate={setActivePage}
        isExpanded={sidebarExpanded}
        onToggleExpand={() => setSidebarExpanded((v) => !v)}
      />

      <main className="flex-1 overflow-hidden">
        <div className="relative h-full overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`h-full ${
                activePage === "dashboard"
                  ? "max-w-screen-xl mx-auto p-6"
                  : "p-6"
              }`}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
