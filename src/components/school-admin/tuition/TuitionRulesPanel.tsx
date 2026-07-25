"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  createAdjustmentRule,
  listAdjustmentRules,
  updateAdjustmentRule,
  type RulePreviewMatch,
} from "@/lib/tuition/rules-engine";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { TuitionAdjustmentRule } from "@/lib/tuition/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type TuitionRulesPanelProps = {
  organizationId: string;
  branding: OrganizationBranding;
  onRefresh: () => void;
};

export default function TuitionRulesPanel({
  organizationId,
  branding,
}: TuitionRulesPanelProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const [rules, setRules] = useState<TuitionAdjustmentRule[]>([]);
  const [csvContent, setCsvContent] = useState("");
  const [importResult, setImportResult] = useState<string | null>(null);
  const [previewRuleId, setPreviewRuleId] = useState<string | null>(null);
  const [previewMatches, setPreviewMatches] = useState<RulePreviewMatch[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const loadRules = useCallback(async () => {
    const rows = await listAdjustmentRules(supabase, organizationId);
    setRules(rows);
  }, [organizationId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadRules();
    });
  }, [loadRules]);

  const handleCreateSiblingRule = async () => {
    await createAdjustmentRule(supabase, {
      organizationId,
      name: "Sibling discount",
      priority: 10,
      conditions: {
        all: [{ field: "active_enrollments_in_family", op: "gte", value: 2 }],
      },
      adjustmentType: "percent_discount",
      valuePercent: 10,
      reason: "Sibling discount",
    });
    await loadRules();
  };

  const handleToggleRule = async (rule: TuitionAdjustmentRule) => {
    await updateAdjustmentRule(supabase, rule.id, { active: !rule.active });
    await loadRules();
  };

  const handleImport = async () => {
    const response = await fetch("/api/tuition/import-financial-aid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId, csvContent }),
    });
    const result = (await response.json()) as { imported?: number; skipped?: number };
    setImportResult(
      `Imported ${result.imported ?? 0}, skipped ${result.skipped ?? 0}.`,
    );
  };

  const handleProcessDue = async () => {
    const response = await fetch("/api/tuition/process-due", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId, graceDays: 5 }),
    });
    const result = (await response.json()) as {
      overdueCount?: number;
      rulesEvaluated?: number;
    };
    setImportResult(
      `Marked ${result.overdueCount ?? 0} overdue, re-evaluated ${result.rulesEvaluated ?? 0} assignments.`,
    );
  };

  const handlePreviewRule = async (rule: TuitionAdjustmentRule) => {
    if (previewRuleId === rule.id) {
      setPreviewRuleId(null);
      setPreviewMatches([]);
      setPreviewError(null);
      return;
    }

    setPreviewRuleId(rule.id);
    setPreviewLoading(true);
    setPreviewError(null);

    try {
      const response = await fetch(`/api/tuition/rules/${rule.id}/preview`);
      const payload = (await response.json()) as {
        matches?: RulePreviewMatch[];
        error?: string;
      };

      if (!response.ok) {
        setPreviewMatches([]);
        setPreviewError(payload.error ?? "Failed to load preview.");
        return;
      }

      setPreviewMatches(payload.matches ?? []);
    } catch (error) {
      setPreviewMatches([]);
      setPreviewError(
        error instanceof Error ? error.message : "Failed to load preview.",
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm" style={{ color: C.textSecondary }}>
          Automatic adjustments apply when enrollments are created or when you run
          process due.
        </p>
        <button
          type="button"
          onClick={() => void handleCreateSiblingRule()}
          className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md"
          style={{ backgroundColor: C.accentLight, color: C.accent }}
        >
          <Plus className="w-4 h-4" />
          Add sibling rule
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="rounded-lg text-sm"
            style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium" style={{ color: C.textPrimary }}>
                  {rule.name}
                </p>
                <p style={{ color: C.textTertiary }}>
                  {rule.reason} · priority {rule.priority}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handlePreviewRule(rule)}
                  className="text-xs font-medium px-2 py-1 rounded"
                  style={{
                    backgroundColor: C.bg,
                    color: C.textPrimary,
                    border: `1px solid ${C.border}`,
                  }}
                  data-testid="tuition-rule-preview-button"
                >
                  {previewRuleId === rule.id ? "Hide preview" : "Preview"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleToggleRule(rule)}
                  className="text-xs font-medium px-2 py-1 rounded"
                  style={{
                    backgroundColor: rule.active ? C.accentLight : C.bg,
                    color: rule.active ? C.accent : C.textTertiary,
                  }}
                >
                  {rule.active ? "Active" : "Inactive"}
                </button>
              </div>
            </div>
            {previewRuleId === rule.id ? (
              <div
                className="border-t px-4 py-3 flex flex-col gap-2"
                style={{ borderColor: C.border }}
                data-testid="tuition-rule-preview"
              >
                {previewLoading ? (
                  <p className="text-xs" style={{ color: C.textSecondary }}>
                    Loading preview…
                  </p>
                ) : previewError ? (
                  <p className="text-xs" style={{ color: C.error }}>
                    {previewError}
                  </p>
                ) : previewMatches.length > 0 ? (
                  <>
                    <p className="text-xs" style={{ color: C.textSecondary }}>
                      {previewMatches.length === 1
                        ? "1 student would be affected"
                        : `${previewMatches.length} students would be affected`}
                    </p>
                    <ul className="flex flex-col gap-2">
                      {previewMatches.map((match) => (
                        <li
                          key={match.assignmentId}
                          className="flex items-center justify-between gap-3 text-xs"
                          data-testid="tuition-rule-preview-row"
                        >
                          <span style={{ color: C.textPrimary }}>
                            {match.familyName} — {match.studentName}
                          </span>
                          {match.alreadyApplied ? (
                            <span
                              className="rounded-full px-2 py-0.5 font-medium"
                              style={{ backgroundColor: C.accentLight, color: C.accent }}
                            >
                              Applied
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-xs" style={{ color: C.textSecondary }}>
                    No families match this rule yet.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        ))}
        {!rules.length ? (
          <p className="text-sm" style={{ color: C.textTertiary }}>
            No rules configured yet.
          </p>
        ) : null}
      </div>

      <div
        className="rounded-lg p-4 flex flex-col gap-3"
        style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}
      >
        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
          Bulk financial aid import
        </p>
        <p className="text-xs" style={{ color: C.textTertiary }}>
          CSV columns: family_email, adjustment_type, value_percent, value_cents, reason
        </p>
        <textarea
          value={csvContent}
          onChange={(e) => setCsvContent(e.target.value)}
          rows={4}
          className="rounded-md px-3 py-2 text-sm font-mono"
          style={{
            backgroundColor: C.input,
            border: `1px solid ${C.inputBorder}`,
            color: C.textPrimary,
          }}
          placeholder="family_email,adjustment_type,value_percent,reason&#10;parent@email.com,percent_discount,15,Financial aid"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void handleImport()}
            className="text-sm font-medium px-3 py-2 rounded-md"
            style={{ backgroundColor: C.accent, color: "#fff" }}
          >
            Import CSV
          </button>
          <button
            type="button"
            onClick={() => void handleProcessDue()}
            className="text-sm font-medium px-3 py-2 rounded-md"
            style={{ backgroundColor: C.accentLight, color: C.accent }}
          >
            Process due & rules
          </button>
        </div>
        {importResult ? (
          <p className="text-xs" style={{ color: C.textSecondary }}>
            {importResult}
          </p>
        ) : null}
      </div>
    </div>
  );
}
