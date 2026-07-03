"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { buildAdminNavGroups } from "@/lib/organization-settings/admin-nav";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";

type SchoolAdminBaselineProps = {
  slug: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  children: ReactNode;
};

function Sidebar({
  C,
  branding,
  slug,
  navGroups,
  pathname,
  isExpanded,
  onToggleExpand,
}: {
  C: AdminThemeTokens;
  branding: OrganizationBranding;
  slug: string;
  navGroups: ReturnType<typeof buildAdminNavGroups>;
  pathname: string;
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
        {navGroups.map((group) => (
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
                const href = schoolAdminPath(slug, item.key);
                const active = pathname === href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.key}
                    href={href}
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
                      textDecoration: "none",
                    }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {isExpanded && (
                      <span className="text-sm font-medium truncate">
                        {item.name}
                      </span>
                    )}
                  </Link>
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
  slug,
  branding,
  features,
  children,
}: SchoolAdminBaselineProps) {
  const pathname = usePathname();

  const navGroups = useMemo(
    () =>
      buildAdminNavGroups(
        features.admin,
        features.feature_nav?.admin,
      ),
    [features.admin, features.feature_nav?.admin],
  );

  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  const bodyFont =
    branding.typography.bodyFont?.trim() || "Inter, system-ui, sans-serif";

  return (
    <div
      className="flex h-dvh w-full overflow-hidden"
      style={{ backgroundColor: C.bg, fontFamily: bodyFont }}
    >
      <Sidebar
        C={C}
        branding={branding}
        slug={slug}
        navGroups={navGroups}
        pathname={pathname}
        isExpanded={sidebarExpanded}
        onToggleExpand={() => setSidebarExpanded((v) => !v)}
      />

      <main className="flex-1 overflow-hidden">
        <div className="relative h-full overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full p-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
