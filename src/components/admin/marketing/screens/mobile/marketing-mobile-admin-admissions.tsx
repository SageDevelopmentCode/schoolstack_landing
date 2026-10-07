import {
  ADMISSIONS_METRICS,
  ADMISSIONS_NEEDS_ATTENTION,
  ADMISSIONS_STATUS_FILTERS,
  ADMISSIONS_SUBMISSION_ROWS,
  ADMISSIONS_SUBTITLE,
} from "@/components/admin/marketing/screens/mobile/marketing-mobile-demo-data";
import {
  MobileAdminShell,
  MobileCard,
  MobileFilterPills,
  MobileKicker,
  MobileSectionTitle,
  MobileStoryChip,
} from "@/components/admin/marketing/screens/mobile/mobile-screen-chrome";
import {
  MARKETING_MOBILE_SECTION_GAP,
  MARKETING_MOBILE_THEME,
} from "@/components/admin/marketing/screens/mobile/marketing-mobile-theme";

const T = MARKETING_MOBILE_THEME;

function SubmissionInitials({ initials }: { initials: string }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 999,
        background: T.soft,
        color: T.primary,
        fontSize: 11,
        fontWeight: 800,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export function MarketingMobileAdminAdmissionsScreen() {
  return (
    <MobileAdminShell activeTab="admissions">
      <div style={{ display: "flex", flexDirection: "column", gap: MARKETING_MOBILE_SECTION_GAP }}>
        <div>
          <MobileKicker>Admissions workspace</MobileKicker>
          <MobileSectionTitle size={20}>Applications</MobileSectionTitle>
          <p style={{ margin: "4px 0 0", fontSize: 10, color: T.muted, lineHeight: 1.35 }}>{ADMISSIONS_SUBTITLE}</p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
          }}
        >
          {ADMISSIONS_METRICS.map((metric) => (
            <MobileCard key={metric.label} compact>
              <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                <div style={{ width: 3, borderRadius: 999, background: metric.accent, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 750, lineHeight: 1.1 }}>{metric.value}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 9, fontWeight: 600, color: T.muted, lineHeight: 1.2 }}>
                    {metric.label}
                  </p>
                </div>
              </div>
            </MobileCard>
          ))}
        </div>

        <div
          style={{
            background: "#EAF4EB",
            border: "1px solid #C7DFCB",
            borderRadius: 12,
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <p style={{ margin: 0, fontSize: 10, lineHeight: 1.45, color: "#42694F" }}>
            <span style={{ fontWeight: 700 }}>Needs attention: </span>
            {ADMISSIONS_NEEDS_ATTENTION.copy}
          </p>
          <span
            style={{
              alignSelf: "flex-start",
              fontSize: 10,
              fontWeight: 700,
              padding: "6px 10px",
              borderRadius: 999,
              background: T.white,
              color: T.primary,
              border: `1px solid ${T.line}`,
            }}
          >
            {ADMISSIONS_NEEDS_ATTENTION.reviewButtonLabel}
          </span>
        </div>

        <MobileFilterPills labels={ADMISSIONS_STATUS_FILTERS} activeIndex={0} compact />

        {ADMISSIONS_SUBMISSION_ROWS.map((row) => (
          <MobileCard key={row.id} compact>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <SubmissionInitials initials={row.initials} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontSize: 13,
                    fontWeight: 560,
                    lineHeight: 1.2,
                  }}
                >
                  {row.studentName}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 9, color: T.muted, lineHeight: 1.3 }}>{row.contactLine}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
              <MobileStoryChip label={row.statusLabel} tone={row.statusTone} />
              <MobileStoryChip label={row.programLabel} tone="info" />
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 9, color: T.muted, lineHeight: 1.3 }}>{row.metaLine}</p>
            {row.nextStepLabel ? (
              <div style={{ marginTop: 6 }}>
                <MobileStoryChip label={row.nextStepLabel} tone={row.nextStepTone ?? "info"} />
              </div>
            ) : null}
          </MobileCard>
        ))}
      </div>
    </MobileAdminShell>
  );
}
