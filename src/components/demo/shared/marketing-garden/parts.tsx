"use client";

import { Clock, GitBranch, Mail, MessageSquare } from "lucide-react";
import { GChip, type GChipTone } from "@/components/school-parent/garden/ui";
import type { AutomationPipeline, AutomationStep } from "@/data/school-demos/demo-marketing-automations";

/** Pastel icon chip per step type (pastels only on icon chips). */
export const STEP_TINTS: Record<AutomationStep["type"], string> = {
  email: "bg-[var(--sf-mint)] text-[var(--sf-forest)]",
  sms: "bg-[var(--sf-sky)] text-[#24507a]",
  wait: "bg-[var(--sf-ink)]/[0.06] text-[var(--sf-ink)]/60",
  condition: "bg-[var(--sf-lav)] text-[var(--sf-ink)]",
};

export const STEP_TYPE_LABELS: Record<AutomationStep["type"], string> = {
  email: "Email",
  sms: "SMS",
  wait: "Wait",
  condition: "Branch",
};

export function StepIcon({ type, className = "h-3.5 w-3.5" }: { type: AutomationStep["type"]; className?: string }) {
  if (type === "email") return <Mail className={className} aria-hidden />;
  if (type === "sms") return <MessageSquare className={className} aria-hidden />;
  if (type === "wait") return <Clock className={className} aria-hidden />;
  return <GitBranch className={className} aria-hidden />;
}

const STATUS: Record<AutomationPipeline["status"], { tone: GChipTone; label: string }> = {
  active: { tone: "success", label: "Active" },
  paused: { tone: "warning", label: "Paused" },
  draft: { tone: "neutral", label: "Draft" },
};

export function PipelineStatusChip({ status }: { status: AutomationPipeline["status"] }) {
  const { tone, label } = STATUS[status];
  return <GChip tone={tone}>{label}</GChip>;
}

export function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}
