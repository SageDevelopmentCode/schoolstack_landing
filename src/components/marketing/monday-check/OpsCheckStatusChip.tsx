import {
  OPS_CHECK_STATUS_LABELS,
  type OpsCheckAnswerStatus,
} from "@/lib/marketing/ops-check-answer-status";

const CHIP_STYLES: Record<OpsCheckAnswerStatus, { bg: string; color: string }> = {
  attention: { bg: "#FFF4D9", color: "#986F14" },
  improving: { bg: "#E9F4F7", color: "#39788C" },
  working: { bg: "#EBF8EF", color: "#34825A" },
};

type OpsCheckStatusChipProps = {
  status: OpsCheckAnswerStatus;
  className?: string;
};

export default function OpsCheckStatusChip({ status, className = "" }: OpsCheckStatusChipProps) {
  const style = CHIP_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold whitespace-nowrap ${className}`}
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {OPS_CHECK_STATUS_LABELS[status]}
    </span>
  );
}
