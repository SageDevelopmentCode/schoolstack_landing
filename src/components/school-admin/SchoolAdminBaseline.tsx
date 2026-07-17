"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import {
  buildAdminNavGroups,
  type AdminNavItem,
} from "@/lib/organization-settings/admin-nav";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { schoolAdminLoginPath } from "@/lib/school-admin/access";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";
import AdminSupportRequestModal from "@/components/school-admin/AdminSupportRequestModal";

type SchoolAdminBaselineProps = {
  slug: string;
  organizationId: string;
  schoolName: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  userEmail?: string | null;
  children: ReactNode;
};

function isParentPathActive(
  pathname: string,
  slug: string,
  parentKey: string,
): boolean {
  const prefix = `/school/${slug}/admin/${parentKey}`;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function SidebarNavItem({
  C,
  slug,
  item,
  pathname,
  isExpanded,
  isOpen,
  onToggleOpen,
}: {
  C: AdminThemeTokens;
  slug: string;
  item: AdminNavItem;
  pathname: string;
  isExpanded: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
}) {
  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);
  const parentActive = isParentPathActive(pathname, slug, item.key);
  const firstChild = item.children?.[0];
  const parentHref = hasChildren
    ? schoolAdminPath(slug, item.key, firstChild!.key)
    : schoolAdminPath(slug, item.key);

  if (!hasChildren) {
    const active = pathname === parentHref;
    return (
      <Link
        href={parentHref}
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
          <span className="text-sm font-medium truncate">{item.name}</span>
        )}
      </Link>
    );
  }

  return (
    <div>
      <div
        className="flex items-center transition-colors duration-150"
        style={{
          borderRadius: C.r.sm,
          backgroundColor: parentActive ? C.accentLight : "transparent",
          border: parentActive
            ? `1px solid ${C.secondaryBtnBorder}`
            : "1px solid transparent",
        }}
      >
        <Link
          href={parentHref}
          title={item.name}
          className="flex flex-1 items-center min-w-0 transition-colors duration-150"
          style={{
            justifyContent: isExpanded ? "flex-start" : "center",
            gap: isExpanded ? "8px" : 0,
            padding: isExpanded ? "7px 10px" : "7px 0",
            color: parentActive ? C.accent : C.textSecondary,
            textDecoration: "none",
          }}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          {isExpanded && (
            <span className="text-sm font-medium truncate">{item.name}</span>
          )}
        </Link>
        {isExpanded ? (
          <button
            type="button"
            onClick={onToggleOpen}
            className="p-1 mr-1 shrink-0"
            style={{ color: parentActive ? C.accent : C.textTertiary }}
            aria-label={isOpen ? "Collapse sub-tabs" : "Expand sub-tabs"}
          >
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform duration-150"
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>
        ) : null}
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex gap-1 pt-0.5 pb-1">
              <div
                className="w-px ml-4 shrink-0"
                style={{ backgroundColor: C.border }}
              />
              <div className="flex-1 space-y-0.5">
                {item.children!.map((child) => {
                  const childHref = schoolAdminPath(slug, item.key, child.key);
                  const childActive = pathname === childHref;
                  const ChildIcon = child.icon;
                  return (
                    <Link
                      key={child.key}
                      href={childHref}
                      title={child.name}
                      className="w-full flex items-center gap-2 text-left text-xs font-medium transition-colors duration-150"
                      style={{
                        padding: "5px 8px",
                        borderRadius: C.r.sm,
                        backgroundColor: childActive
                          ? C.accentLight
                          : "transparent",
                        color: childActive ? C.accent : C.textTertiary,
                        textDecoration: "none",
                      }}
                    >
                      <ChildIcon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{child.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Sidebar({
  C,
  branding,
  schoolName,
  slug,
  navGroups,
  pathname,
  isExpanded,
  onToggleExpand,
  userEmail,
  onSignOut,
  onOpenSupport,
}: {
  C: AdminThemeTokens;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
  navGroups: ReturnType<typeof buildAdminNavGroups>;
  pathname: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  userEmail?: string | null;
  onSignOut: () => void;
  onOpenSupport: () => void;
}) {
  const { logo } = branding;
  const [openParents, setOpenParents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const group of navGroups) {
      for (const item of group.items) {
        if (
          item.children?.length &&
          isParentPathActive(pathname, slug, item.key)
        ) {
          next[item.key] = true;
        }
      }
    }
    queueMicrotask(() => {
      setOpenParents((prev) => ({ ...prev, ...next }));
    });
  }, [pathname, slug, navGroups]);

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
        {logo.src.trim() ? (
          <Image
            src={logo.src.trim()}
            alt={logo.alt || schoolName}
            width={isExpanded ? (logo.width ?? 160) : 36}
            height={logo.height ?? 40}
            className="flex-shrink-0 object-contain"
            style={{ maxHeight: 40 }}
          />
        ) : (
          <span
            className="truncate text-sm font-semibold"
            style={{ color: C.accentDark }}
            title={schoolName}
          >
            {logo.alt.trim() || schoolName}
          </span>
        )}
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
          onClick={onOpenSupport}
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
          <Image
            src="/images/Logo.png"
            alt=""
            width={20}
            height={20}
            className="w-5 h-5 flex-shrink-0 object-contain"
            aria-hidden
          />
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
              {group.items.map((item) => (
                <SidebarNavItem
                  key={item.key}
                  C={C}
                  slug={slug}
                  item={item}
                  pathname={pathname}
                  isExpanded={isExpanded}
                  isOpen={openParents[item.key] ?? false}
                  onToggleOpen={() =>
                    setOpenParents((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                />
              ))}
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
        {isExpanded && userEmail ? (
          <p
            className="mb-2 truncate px-2 text-xs"
            style={{ color: C.textTertiary }}
            title={userEmail}
          >
            {userEmail}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onSignOut}
          title="Sign out"
          className="mb-2 w-full flex items-center transition-colors duration-150"
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
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {isExpanded && <span className="text-xs font-medium">Sign out</span>}
        </button>
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
  organizationId,
  schoolName,
  branding,
  features,
  userEmail,
  children,
}: SchoolAdminBaselineProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const navGroups = useMemo(
    () =>
      buildAdminNavGroups(
        features.admin,
        features.feature_nav?.admin,
      ),
    [features.admin, features.feature_nav?.admin],
  );

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [supportOpen, setSupportOpen] = useState(false);

  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  const bodyFont =
    branding.typography.bodyFont?.trim() || "Inter, system-ui, sans-serif";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(schoolAdminLoginPath(slug));
    router.refresh();
  };

  return (
    <div
      className="flex h-dvh w-full overflow-hidden"
      style={{ backgroundColor: C.bg, fontFamily: bodyFont }}
    >
      <Sidebar
        C={C}
        branding={branding}
        schoolName={schoolName}
        slug={slug}
        navGroups={navGroups}
        pathname={pathname}
        isExpanded={sidebarExpanded}
        onToggleExpand={() => setSidebarExpanded((v) => !v)}
        userEmail={userEmail}
        onSignOut={handleSignOut}
        onOpenSupport={() => setSupportOpen(true)}
      />

      <AdminSupportRequestModal
        C={C}
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
        organizationId={organizationId}
        userEmail={userEmail}
        currentPath={pathname}
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
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
