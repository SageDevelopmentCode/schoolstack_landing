"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Link2, Loader2, Star, Trash2 } from "lucide-react";
import { PortalAccountLinkHubDiagram } from "@/components/admin/account-links/PortalAccountLinkHubDiagram";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import type {
  CrossRoleSingleLoginAccount,
  PortalAccessBadgeFlags,
  PortalAccountLinkGroupRecord,
  PortalRolePillars,
  UnlinkedPortalIdentity,
} from "@/lib/auth/organization-portal-account-links";
import {
  badgesToRolePillars,
  formatPortalAccessSummary,
  formatPortalPillarSummary,
  guardianContactEmailsForDisplay,
  unionRolePillars,
} from "@/lib/auth/organization-portal-account-links";

type OrganizationAccountLinksPanelProps = {
  organizationId: string;
  organizationName: string;
};

function PortalBadge({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  if (!active) return null;

  return (
    <span className="inline-flex rounded-full border border-admin-border bg-admin-neutral-bg px-2 py-0.5 text-[11px] font-medium text-admin-muted">
      {label}
    </span>
  );
}

function effectivePortalBadges(badges: PortalAccessBadgeFlags) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <PortalBadge label="School admin" active={badges.schoolAdmin} />
      <PortalBadge label="Staff portal" active={badges.teacherPortal} />
      <PortalBadge label="Applications" active={badges.familyApply} />
      <PortalBadge label="Parent portal" active={badges.parentPortal} />
    </div>
  );
}

function rolePillarBadges(pillars: PortalRolePillars) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <PortalBadge label="School admin" active={pillars.schoolAdmin} />
      <PortalBadge label="Staff portal" active={pillars.staffPortal} />
      <PortalBadge label="Family portal" active={pillars.familyPortal} />
    </div>
  );
}

function identityLabel(identity: UnlinkedPortalIdentity): string {
  return identity.email ?? identity.userId;
}

function identityOptionLabel(identity: UnlinkedPortalIdentity): string {
  const summary = formatPortalPillarSummary(
    badgesToRolePillars(identity.badges),
  );
  return `${identityLabel(identity)} — ${summary}`;
}

export default function OrganizationAccountLinksPanel({
  organizationId,
  organizationName,
}: OrganizationAccountLinksPanelProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<PortalAccountLinkGroupRecord[]>([]);
  const [unlinked, setUnlinked] = useState<UnlinkedPortalIdentity[]>([]);
  const [crossRoleSingleLoginAccounts, setCrossRoleSingleLoginAccounts] =
    useState<CrossRoleSingleLoginAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [primaryUserId, setPrimaryUserId] = useState("");
  const [selectedMemberUserIds, setSelectedMemberUserIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [label, setLabel] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/account-links`,
      );
      const payload = (await response.json()) as {
        groups?: PortalAccountLinkGroupRecord[];
        unlinked?: UnlinkedPortalIdentity[];
        crossRoleSingleLoginAccounts?: CrossRoleSingleLoginAccount[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load account links.");
      }

      setGroups(payload.groups ?? []);
      setUnlinked(payload.unlinked ?? []);
      setCrossRoleSingleLoginAccounts(
        payload.crossRoleSingleLoginAccounts ?? [],
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load account links.",
      );
      setGroups([]);
      setUnlinked([]);
      setCrossRoleSingleLoginAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredUnlinked = useMemo(() => {
    if (!normalizedSearch) return unlinked;
    return unlinked.filter((identity) => {
      const haystack = [
        identity.email,
        identity.userId,
        formatPortalAccessSummary(identity.badges),
        identity.sources.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [normalizedSearch, unlinked]);

  const primaryIdentity = unlinked.find(
    (identity) => identity.userId === primaryUserId,
  );

  const additionalCandidates = useMemo(
    () =>
      filteredUnlinked.filter((identity) => identity.userId !== primaryUserId),
    [filteredUnlinked, primaryUserId],
  );

  const previewPillars = useMemo(() => {
    const sets: PortalRolePillars[] = [];
    if (primaryIdentity) {
      sets.push(badgesToRolePillars(primaryIdentity.badges));
    }
    for (const userId of selectedMemberUserIds) {
      const identity = unlinked.find((item) => item.userId === userId);
      if (identity) sets.push(badgesToRolePillars(identity.badges));
    }
    return unionRolePillars(sets);
  }, [primaryIdentity, selectedMemberUserIds, unlinked]);

  const toggleMemberSelection = (userId: string) => {
    setSelectedMemberUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const addToLinkBuilder = (identity: UnlinkedPortalIdentity) => {
    if (!primaryUserId) {
      setPrimaryUserId(identity.userId);
      return;
    }
    if (identity.userId === primaryUserId) return;
    toggleMemberSelection(identity.userId);
  };

  const handleCreateLinkGroup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!primaryIdentity?.email) {
      setError("Choose a primary login with a resolved email.");
      return;
    }

    const memberEmails = [...selectedMemberUserIds]
      .map(
        (userId) => unlinked.find((identity) => identity.userId === userId)?.email,
      )
      .filter((email): email is string => Boolean(email));

    if (memberEmails.length === 0) {
      setError("Select at least one other account to link.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/account-links`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            primaryEmail: primaryIdentity.email,
            memberEmails,
            label: label.trim() ? label : null,
          }),
        },
      );
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create link group.");
      }

      setPrimaryUserId("");
      setSelectedMemberUserIds(new Set());
      setLabel("");
      await load();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to create link group.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimary = async (groupId: string, userId: string) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/account-links/${groupId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ primaryUserId: userId }),
        },
      );
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to set primary login.");
      }

      await load();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to set primary login.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (
    groupId: string,
    memberId: string,
    email: string | null,
  ) => {
    const confirmed = window.confirm(
      `Remove ${email ?? "this account"} from the link group? They will only see portals tied to their own login.`,
    );
    if (!confirmed) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/account-links/${groupId}/members/${memberId}`,
        { method: "DELETE" },
      );
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to remove linked account.");
      }

      await load();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to remove linked account.",
      );
    } finally {
      setSaving(false);
    }
  };

  const canCreateGroup =
    Boolean(primaryIdentity?.email) && selectedMemberUserIds.size > 0;

  const previewLinkedAccounts = useMemo(() => {
    return [...selectedMemberUserIds]
      .map((userId) => unlinked.find((item) => item.userId === userId))
      .filter((identity): identity is UnlinkedPortalIdentity => identity != null)
      .map((identity) => ({
        email: identityLabel(identity),
        pillars: badgesToRolePillars(identity.badges),
      }));
  }, [selectedMemberUserIds, unlinked]);

  const showPreviewDiagram =
    Boolean(primaryIdentity) && previewLinkedAccounts.length > 0;

  return (
    <div className="space-y-6">
      <section className="rounded-admin-md border border-admin-border bg-admin-accent-soft/25 p-5 space-y-2">
        <h2 className="text-base font-semibold text-admin-text font-secondary">
          Link two logins (same person)
        </h2>
        <p className="text-sm text-admin-muted font-secondary max-w-3xl">
          When someone uses one email for the staff portal and another for the
          parent portal, link those accounts here. Pick a{" "}
          <span className="font-medium text-admin-text">primary login</span>{" "}
          (the email they should use day to day). After linking, sign-in unlocks
          every portal tied to any linked account—for example staff and family in
          one switcher. Passwords stay on each login; this only combines portal
          access for {organizationName}.
        </p>
        <p className="text-sm text-admin-muted font-secondary max-w-3xl">
          If they already use{" "}
          <span className="font-medium text-admin-text">one email</span> for
          staff and family, you do not need linking—see Advanced at the bottom of
          this tab.
        </p>
      </section>

      <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-4">
        <div>
          <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
            Link two logins
          </h2>
          <p className="mt-1 text-sm text-admin-muted font-secondary">
            Select the primary sign-in email, then choose other logins for the
            same person. Guardian and staff roster contact emails are not
            changed.
          </p>
        </div>

        {error ? (
          <p
            className="rounded-admin-md border border-admin-accent/30 bg-admin-accent-soft/30 px-3 py-2 text-sm text-admin-accent font-secondary"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <label className="block space-y-1">
          <span className="text-xs text-admin-muted font-secondary">
            Search accounts
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Filter by email or portal access…"
            className="w-full text-sm border border-admin-border rounded-admin-md px-3 py-2 bg-admin-bg"
          />
        </label>

        <form onSubmit={handleCreateLinkGroup} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-xs text-admin-muted font-secondary">
              Primary login
            </span>
            <p className="text-[11px] text-admin-faint font-secondary">
              The email they should use day to day. Portal access combines all
              linked accounts.
            </p>
            <AdminSelect
              value={primaryUserId}
              onChange={(event) => {
                setPrimaryUserId(event.target.value);
                setSelectedMemberUserIds(new Set());
              }}
              className="w-full"
              triggerClassName="px-3 py-2"
              disabled={loading || unlinked.length === 0}
            >
              <option value="">Select an account…</option>
              {filteredUnlinked.map((identity) => (
                <option key={identity.userId} value={identity.userId}>
                  {identityOptionLabel(identity)}
                </option>
              ))}
            </AdminSelect>
          </label>

          <div className="space-y-2">
            <p className="text-xs text-admin-muted font-secondary">
              Also link (other login for the same person)
            </p>
            <p className="text-[11px] text-admin-faint font-secondary">
              For example a parent-portal email separate from their staff login.
            </p>
            {loading ? (
              <p className="text-sm text-admin-faint font-secondary">Loading…</p>
            ) : !primaryUserId ? (
              <p className="text-sm text-admin-faint font-secondary">
                Choose a primary login first.
              </p>
            ) : additionalCandidates.length === 0 ? (
              <p className="text-sm text-admin-faint font-secondary">
                No other accounts match your search.
              </p>
            ) : (
              <ul className="divide-y divide-admin-border rounded-admin-md border border-admin-border overflow-hidden max-h-64 overflow-y-auto">
                {additionalCandidates.map((identity) => {
                  const checked = selectedMemberUserIds.has(identity.userId);
                  return (
                    <li
                      key={identity.userId}
                      className="flex items-start gap-3 bg-admin-bg px-3 py-2.5"
                    >
                      <input
                        type="checkbox"
                        id={`link-member-${identity.userId}`}
                        checked={checked}
                        onChange={() => toggleMemberSelection(identity.userId)}
                        className="mt-1"
                      />
                      <label
                        htmlFor={`link-member-${identity.userId}`}
                        className="min-w-0 flex-1 cursor-pointer space-y-1"
                      >
                        <p className="text-sm font-medium text-admin-text">
                          {identityLabel(identity)}
                        </p>
                        <p className="text-xs text-admin-muted font-secondary">
                          {identity.sources.join(" · ")}
                        </p>
                        {effectivePortalBadges(identity.badges)}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {showPreviewDiagram && primaryIdentity ? (
            <PortalAccountLinkHubDiagram
              variant="preview"
              primary={{
                email: identityLabel(primaryIdentity),
                pillars: badgesToRolePillars(primaryIdentity.badges),
              }}
              linked={previewLinkedAccounts}
              mergedPillars={previewPillars}
            />
          ) : null}

          <label className="block space-y-1">
            <span className="text-xs text-admin-muted font-secondary">
              Label (optional)
            </span>
            <input
              type="text"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Rachael Sparhawk"
              className="w-full text-sm border border-admin-border rounded-admin-md px-3 py-2 bg-admin-bg"
            />
          </label>

          <button
            type="submit"
            disabled={saving || !canCreateGroup}
            className="inline-flex items-center justify-center gap-2 rounded-admin-md bg-admin-accent px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
            Link accounts
          </button>
        </form>
      </section>

      <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-4">
        <h3 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
          Active link groups
        </h3>
        <p className="text-sm text-admin-muted font-secondary">
          People with multiple logins linked for this school. Primary is the
          recommended sign-in email.
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-admin-faint font-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading account links…
          </div>
        ) : groups.length === 0 ? (
          <p className="text-sm text-admin-faint font-secondary">
            No linked accounts yet. Use the form above to link a staff login
            with a parent login (or other separate emails).
          </p>
        ) : (
          <ul className="space-y-4">
            {groups.map((group) => {
              const primaryMember = group.members.find(
                (member) => member.userId === group.primaryUserId,
              );
              const linkedMembers = group.members.filter(
                (member) => member.userId !== group.primaryUserId,
              );
              const primaryEmail =
                primaryMember?.email ??
                group.primaryEmail ??
                group.primaryUserId;
              const mergedPillars = badgesToRolePillars(group.effectiveBadges);

              return (
              <li
                key={group.id}
                className="rounded-admin-md border border-admin-border bg-admin-bg p-4 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-admin-text">
                      {group.label ?? "Linked accounts"}
                    </p>
                  </div>
                  {rolePillarBadges(mergedPillars)}
                </div>

                <PortalAccountLinkHubDiagram
                  variant="group"
                  primary={{
                    email: primaryEmail,
                    pillars: badgesToRolePillars(
                      primaryMember?.badges ?? group.effectiveBadges,
                    ),
                  }}
                  linked={linkedMembers.map((member) => ({
                    email: member.email ?? member.userId,
                    pillars: badgesToRolePillars(member.badges),
                  }))}
                  mergedPillars={mergedPillars}
                />

                <ul className="divide-y divide-admin-border rounded-admin-md border border-admin-border overflow-hidden">
                  {group.members.map((member) => {
                    const isPrimary = member.userId === group.primaryUserId;

                    return (
                      <li
                        key={member.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 bg-admin-surface"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-admin-text truncate">
                              {member.email ?? member.userId}
                            </p>
                            {isPrimary ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-admin-accent-soft px-2 py-0.5 text-[11px] font-semibold text-admin-accent">
                                <Star className="h-3 w-3" aria-hidden />
                                Primary login
                              </span>
                            ) : null}
                          </div>
                          {effectivePortalBadges(member.badges)}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {!isPrimary ? (
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() =>
                                void handleSetPrimary(group.id, member.userId)
                              }
                              className="rounded-admin-sm border border-admin-border px-2.5 py-1.5 text-xs font-medium text-admin-muted hover:bg-admin-neutral-bg disabled:opacity-60"
                            >
                              Set as primary
                            </button>
                          ) : null}
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              void handleRemoveMember(
                                group.id,
                                member.id,
                                member.email,
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-admin-sm border border-admin-border px-2.5 py-1.5 text-xs font-medium text-admin-muted hover:bg-admin-neutral-bg disabled:opacity-60"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
            })}
          </ul>
        )}
      </section>

      <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3">
        <h3 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
          Unlinked logins
        </h3>
        <p className="text-sm text-admin-muted font-secondary">
          Separate sign-in accounts not in a link group yet. Use search above or
          add from here.
        </p>

        {loading ? null : filteredUnlinked.length === 0 ? (
          <p className="text-sm text-admin-faint font-secondary">
            {unlinked.length === 0
              ? "Everyone with portal access is in a link group, or this school has no accounts."
              : "No accounts match your search."}
          </p>
        ) : (
          <ul className="divide-y divide-admin-border rounded-admin-md border border-admin-border overflow-hidden">
            {filteredUnlinked.map((identity) => (
              <li
                key={identity.userId}
                className="flex flex-wrap items-center justify-between gap-3 bg-admin-bg px-3 py-3"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-admin-text truncate">
                    {identityLabel(identity)}
                  </p>
                  <p className="text-xs text-admin-muted font-secondary">
                    {identity.sources.join(" · ")}
                  </p>
                  {effectivePortalBadges(identity.badges)}
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => addToLinkBuilder(identity)}
                  className="rounded-admin-sm border border-admin-border px-2.5 py-1.5 text-xs font-medium text-admin-muted hover:bg-admin-neutral-bg disabled:opacity-60"
                >
                  {primaryUserId === identity.userId
                    ? "Primary"
                    : selectedMemberUserIds.has(identity.userId)
                      ? "Selected"
                      : "Add to link builder"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <details className="group rounded-admin-md border border-admin-border bg-admin-surface">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-admin-text font-secondary [&::-webkit-details-marker]:hidden">
          <span>Advanced: already one login for multiple roles</span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-admin-muted transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="space-y-3 border-t border-admin-border px-4 py-4">
          <p className="text-sm text-admin-muted font-secondary">
            These people already reach more than one portal area with a single
            sign-in email. That is normal database setup—not a link group. Only
            use linking above when the same person has{" "}
            <span className="font-medium text-admin-text">two different</span>{" "}
            login emails.
          </p>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-admin-faint font-secondary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : crossRoleSingleLoginAccounts.length === 0 ? (
            <p className="text-sm text-admin-faint font-secondary">
              No single-login cross-role accounts found for this school.
            </p>
          ) : (
            <ul className="divide-y divide-admin-border rounded-admin-md border border-admin-border overflow-hidden">
              {crossRoleSingleLoginAccounts.map((account) => {
                const familyContacts = guardianContactEmailsForDisplay(
                  account.loginEmail,
                  account.guardianContactEmails,
                );

                return (
                  <li
                    key={account.userId}
                    className="bg-admin-bg px-3 py-3 space-y-1"
                  >
                    <p className="text-sm text-admin-text font-secondary">
                      <span className="text-admin-muted">Login:</span>{" "}
                      <span className="font-medium font-mono text-[13px]">
                        {account.loginEmail ?? account.userId}
                      </span>
                    </p>
                    {familyContacts.length > 0 ? (
                      <p className="text-xs text-admin-muted font-secondary">
                        Family contact on file:{" "}
                        <span className="font-mono text-[12px] text-admin-text">
                          {familyContacts.join(", ")}
                        </span>
                        <span className="block mt-0.5 text-admin-faint">
                          Not a second login—guardian contact email only.
                        </span>
                      </p>
                    ) : null}
                    <p className="text-xs text-admin-muted font-secondary">
                      {account.sources.join(" · ")}
                    </p>
                    {rolePillarBadges(account.pillars)}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </details>
    </div>
  );
}
