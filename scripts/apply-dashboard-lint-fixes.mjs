import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "..");

function collectDashboardFiles(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) collectDashboardFiles(full, acc);
    else if (ent.name.endsWith("AdminDashboardDemo.tsx")) acc.push(full);
  }
  return acc;
}

const files = [
  path.join(root, "src/components/sections/AdminDashboardDemo.tsx"),
  ...collectDashboardFiles(path.join(root, "src/components/demo")),
];

function apply(content) {
  let next = content;

  // Globals: stop mutating module-level C during render
  next = next.replace(/^let C = C_DARK;/m, "const C = C_LIGHT;");
  next = next.replace(
    /  const \[isDark\] = useState\(false\);\n  C = isDark \? C_DARK : C_LIGHT;\n\n/,
    "",
  );

  // Pattern 1: delayed new submission reveal
  next = next.replace(
    `  const [newSubmissionRevealed, setNewSubmissionRevealed] = useState(
    !animateNewSubmission,
  );

  useEffect(() => {
    if (!animateNewSubmission) {
      setNewSubmissionRevealed(true);
      return;
    }
    setNewSubmissionRevealed(false);
    const timer = setTimeout(() => setNewSubmissionRevealed(true), 700);
    return () => clearTimeout(timer);
  }, [animateNewSubmission]);`,
    `  const [timedReveal, setTimedReveal] = useState(false);
  const newSubmissionRevealed = !animateNewSubmission || timedReveal;

  useEffect(() => {
    if (!animateNewSubmission) return;
    const timer = setTimeout(() => setTimedReveal(true), 700);
    return () => {
      clearTimeout(timer);
      setTimedReveal(false);
    };
  }, [animateNewSubmission]);`,
  );

  // Pattern 2: remove activeTab sync effect
  next = next.replace(
    `  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, lead.id]);

`,
    "",
  );

  // Pattern 3: enrollment link animation
  next = next.replace(
    `  const [enrollmentLinkSent, setEnrollmentLinkSent] = useState(
    !autoSendEnrollmentLink,
  );

  useEffect(() => {
    if (!autoSendEnrollmentLink) {
      setEnrollmentLinkSent(false);
      return;
    }
    setEnrollmentLinkSent(false);
    const timer = setTimeout(() => setEnrollmentLinkSent(true), 1000);
    return () => clearTimeout(timer);
  }, [autoSendEnrollmentLink, lead.id]);

`,
    `  const [linkSentDelayed, setLinkSentDelayed] = useState(false);
  const enrollmentLinkSent = !autoSendEnrollmentLink || linkSentDelayed;

  useEffect(() => {
    if (!autoSendEnrollmentLink) return;
    const timer = setTimeout(() => setLinkSentDelayed(true), 1000);
    return () => {
      clearTimeout(timer);
      setLinkSentDelayed(false);
    };
  }, [autoSendEnrollmentLink, lead.id]);

`,
  );

  // Pattern 4: remove lead reset effect (key remount + buildLeadActivity initializer)
  const leadResetEffect = /  useEffect\(\(\) => \{\n    setLeadStatus\(lead\.status\);\n    setLeadTags\(\[\.\.\.lead\.tags\]\);\n    setTagDraft\(""\);\n    const statusLabel = STATUS_COLORS\[lead\.status\]\?\.label \?\? lead\.status;\n    const initial: LeadActivityEntry\[\] = \[[\s\S]*?    setActivity\(initial\);\n    setAdminNotes\(""\);\n  \}, \[lead\.id, lead\.date, lead\.email, lead\.status, lead\.tags\]\);\n\n/;
  next = next.replace(
    leadResetEffect,
    "",
  );

  if (!next.includes("function buildLeadActivity(")) {
    next = next.replace(
      "function LeadDetailPanel({",
      `function buildLeadActivity(lead: DemoLead): LeadActivityEntry[] {
  const statusLabel = STATUS_COLORS[lead.status]?.label ?? lead.status;
  const initial: LeadActivityEntry[] = [
    {
      id: \`\${lead.id}-a0\`,
      at: \`\${lead.date} · 9:02 AM\`,
      actor: "System",
      title: "Submission received",
      summary: "Form submission received and queued for review.",
      variant: "mail",
    },
    {
      id: \`\${lead.id}-a1\`,
      at: \`\${lead.date} · 9:03 AM\`,
      actor: "Automation",
      title: "Confirmation sent",
      summary: \`Confirmation email sent to \${lead.email}.\`,
      variant: "mail",
    },
  ];
  if (lead.tags.length > 0) {
    initial.push({
      id: \`\${lead.id}-a2\`,
      at: \`\${lead.date} · 10:15 AM\`,
      actor: "Jordan M.",
      title: "Tags updated",
      summary: \`Added tags: \${lead.tags.join(", ")}.\`,
      variant: "note",
    });
  }
  if (lead.status !== "new") {
    initial.push({
      id: \`\${lead.id}-a3\`,
      at: \`\${lead.date} · 2:40 PM\`,
      actor: "Jordan M.",
      title: "Status updated",
      summary: \`Status set to \${statusLabel}.\`,
      variant: "action",
    });
  }
  return initial;
}

function LeadDetailPanel({`,
    );
  }

  next = next.replace(
    "  const [activity, setActivity] = useState<LeadActivityEntry[]>([]);",
    "  const [activity, setActivity] = useState<LeadActivityEntry[]>(() => buildLeadActivity(lead));",
  );

  // Pattern 5: flow selection reset via helper
  next = next.replace(
    `  useEffect(() => {
    setExpandedStepId(null);
    setExpandedActionId(null);
    setShowAddActionPicker(false);
  }, [selectedFlowId]);

  const ACTION_META`,
    `  const selectFlow = (id: string) => {
    setSelectedFlowId(id);
    setExpandedStepId(null);
    setExpandedActionId(null);
    setShowAddActionPicker(false);
  };

  const ACTION_META`,
  );

  next = next.replace(
    "    setFlows((prev) => [newFlow, ...prev]);\n    setSelectedFlowId(id);\n    setExpandedStepId(null);",
    "    setFlows((prev) => [newFlow, ...prev]);\n    selectFlow(id);",
  );

  next = next.replace(
    "onClick={() => { setSelectedFlowId(flow.id); setExpandedStepId(null); }}",
    "onClick={() => selectFlow(flow.id)}",
  );

  // Pattern 6: derive valid expanded step id
  next = next.replace(
    `  useEffect(() => {
    if (
      expandedStepId &&
      selectedFlow &&
      !selectedFlow.steps.some((s) => s.id === expandedStepId)
    ) {
      setExpandedStepId(null);
    }
  }, [selectedFlow, expandedStepId]);

  const updateFlow`,
    `  const validExpandedStepId =
    expandedStepId &&
    selectedFlow?.steps.some((s) => s.id === expandedStepId)
      ? expandedStepId
      : null;

  const updateFlow`,
  );

  next = next.replace(
    "isExpanded={expandedStepId === step.id}",
    "isExpanded={validExpandedStepId === step.id}",
  );

  // Remove erroneous global replace block
  next = next.replace(
    `  if (!next.includes("validExpandedStepId")) {
    next = next.replace(
      "  const selectedFlow = flows.find((f) => f.id === selectedFlowId) ?? null;",
      \`  const selectedFlow = flows.find((f) => f.id === selectedFlowId) ?? null;
  const validExpandedStepId =
    expandedStepId &&
    selectedFlow?.steps.some((s) => s.id === expandedStepId)
      ? expandedStepId
      : null;\`,
    );
    next = next.replace(/\\bexpandedStepId\\b/g, (match, offset) => {
      const before = next.slice(Math.max(0, offset - 30), offset);
      if (
        before.includes("validExpanded") ||
        before.includes("setExpandedStepId") ||
        before.includes("const expandedStepId") ||
        before.includes("[expandedStepId")
      ) {
        return match;
      }
      return "validExpandedStepId";
    });
  }

`,
    "",
  );

  // Pattern 7: admissions tab backdrop (remove selectedLead sync from effect)
  next = next.replace(
    `  useEffect(() => {
    if (activeTab !== "submissions") {
      setSelectedLead(null);
      closeBackdrop();
      return;
    }
    if (selectedLead) openBackdrop(() => setSelectedLead(null));
    else closeBackdrop();
  }, [activeTab, selectedLead, openBackdrop, closeBackdrop]);`,
    `  useEffect(() => {
    if (activeTab !== "submissions") {
      closeBackdrop();
      return;
    }
    if (selectedLead) openBackdrop(() => setSelectedLead(null));
    else closeBackdrop();
  }, [activeTab, selectedLead, openBackdrop, closeBackdrop]);`,
  );

  next = next.replace(
    `<AdmissionsPage
            activeTab={admissionsTab}`,
    `<AdmissionsPage
            key={admissionsTab}
            activeTab={admissionsTab}`,
  );

  // Pattern 8-10: tuition page effects
  next = next.replace(
    `  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

`,
    "",
  );

  next = next.replace(
    `  useEffect(() => {
    if (selectedFamilyId) {
      const match = DEMO_FAMILY_BILLING.find((f) => f.id === selectedFamilyId);
      if (match) {
        setSelectedFamily(match);
        setOpenScheduleKey(null);
      }
    }
  }, [selectedFamilyId]);

`,
    "",
  );

  next = next.replace(
    `  useEffect(() => {
    if (reminderModalOpen) {
      setSelectedTx(null);
      setOpenScheduleKey(null);
      closeBackdrop();
    }
  }, [reminderModalOpen, closeBackdrop]);

`,
    "",
  );

  next = next.replace(
    `        <TuitionPage
          selectedFamilyId={selectedTuitionFamilyId}
          initialFilter={tuitionFilter}`,
    `        <TuitionPage
          key={\`\${selectedTuitionFamilyId ?? "none"}-\${tuitionFilter}\`}
          selectedFamilyId={selectedTuitionFamilyId}
          initialFilter={tuitionFilter}`,
  );

  // openReminderModal: drop useCallback to satisfy preserve-manual-memoization
  next = next.replace(
    `  const openReminderModal = useCallback((familyIds?: string[]) => {
    setSelectedTx(null);
    setOpenScheduleKey(null);
    setReminderInitialIds(familyIds);
    setReminderModalOpen(true);
  }, []);`,
    `  const openReminderModal = (familyIds?: string[]) => {
    setSelectedTx(null);
    setOpenScheduleKey(null);
    setReminderInitialIds(familyIds);
    setReminderModalOpen(true);
    closeBackdrop();
  };`,
  );

  // Pattern 11: revenue date picker open handler
  next = next.replace(
    `  useEffect(() => {
    if (!open) return;
    const sel = isoToDate(value);
    setViewYear(sel.getFullYear());
    setViewMonth(sel.getMonth());
  }, [open, value]);

`,
    "",
  );

  next = next.replace(
    "        onClick={() => setOpen((v) => !v)}",
    `        onClick={() => {
          if (!open) {
            const sel = isoToDate(value);
            setViewYear(sel.getFullYear());
            setViewMonth(sel.getMonth());
            setOpen(true);
          } else {
            setOpen(false);
          }
        }}`,
  );

  // Pattern 12: staff page focus
  next = next.replace(
    `  const [selectedStaff, setSelectedStaff] = useState<DemoStaff>(DEMO_STAFF[0]);
  const [profileTab, setProfileTab] = useState<StaffProfileTab>("profile");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!focusStaffId) return;
    const member = DEMO_STAFF.find((s) => s.id === focusStaffId);
    if (member) {
      setSelectedStaff(member);
      setProfileTab(focusStaffTab ?? "payroll");
    }
    onFocusConsumed?.();
  }, [focusStaffId, focusStaffTab, onFocusConsumed]);`,
    `  const [selectedStaff, setSelectedStaff] = useState<DemoStaff>(
    () =>
      (focusStaffId
        ? DEMO_STAFF.find((s) => s.id === focusStaffId)
        : undefined) ?? DEMO_STAFF[0],
  );
  const [profileTab, setProfileTab] = useState<StaffProfileTab>(
    focusStaffTab ?? "profile",
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!focusStaffId) return;
    onFocusConsumed?.();
  }, [focusStaffId, onFocusConsumed]);`,
  );

  next = next.replace(
    `        <StaffPage
          focusStaffId={focusStaffId}`,
    `        <StaffPage
          key={focusStaffId ?? "default"}
          focusStaffId={focusStaffId}`,
  );

  return next;
}

let changed = 0;
for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  const after = apply(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
    console.log("updated", path.relative(root, file));
  }
}
console.log(`Done. Updated ${changed} files.`);
