import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "..");

function walk(dir, pattern, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, pattern, acc);
    else if (pattern.test(full)) acc.push(full);
  }
  return acc;
}

const srcFiles = walk(path.join(root, "src"), /\.(tsx|ts)$/);

function apply(content, file) {
  let next = content;

  // Parent dashboard typing animation
  next = next.replace(
    `  useEffect(() => {
    if (!typingTarget) return;
    setMsgInput("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setMsgInput(typingTarget.slice(0, i));
      if (i >= typingTarget.length) {
        clearInterval(id);
        setTypingTarget(null);
      }
    }, 55);
    return () => clearInterval(id);
  }, [typingTarget]);`,
    `  useEffect(() => {
    if (!typingTarget) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setMsgInput(typingTarget.slice(0, i));
      if (i >= typingTarget.length) {
        clearInterval(id);
        setTypingTarget(null);
      }
    }, 55);
    return () => {
      clearInterval(id);
      setMsgInput("");
    };
  }, [typingTarget]);`,
  );

  next = next.replace(
    'action: () => setTypingTarget("Sounds good, see you Thursday!"),',
    'action: () => {\n          setMsgInput("");\n          setTypingTarget("Sounds good, see you Thursday!");\n        },',
  );

  // Defer data-loading effects that synchronously call setState
  const loaders = [
    "loadDetail()",
    "loadForms()",
    "loadRows()",
    "loadHistory()",
    "loadSubmissions()",
    "loadSlots()",
    "loadVisits()",
    "loadPrograms()",
    "loadTemplates()",
    "loadChecklist()",
    "loadData()",
    "loadItems()",
    "loadEvents()",
    "loadBookedForDate(selectedDate)",
    "refresh()",
    "reload()",
  ];

  for (const call of loaders) {
    next = next.replace(
      `useEffect(() => {\n    ${call};\n  },`,
      `useEffect(() => {\n    queueMicrotask(() => {\n      void ${call.endsWith(")") ? call : call};\n    });\n  },`,
    );
    next = next.replace(
      `useEffect(() => {\n    void ${call};\n  },`,
      `useEffect(() => {\n    queueMicrotask(() => {\n      void ${call};\n    });\n  },`,
    );
    next = next.replace(
      `useEffect(() => {\n    if (activeTab === "history") {\n      void ${call};\n    }\n  },`,
      `useEffect(() => {\n    if (activeTab === "history") {\n      queueMicrotask(() => {\n        void ${call};\n      });\n    }\n  },`,
    );
  }

  // ApplicationSubmissionDetailPanel: remove redundant reset when parent uses key
  if (file.endsWith("ApplicationSubmissionDetailPanel.tsx")) {
    next = next.replace(
      `  useEffect(() => {
    setActiveTab("overview");
    setHistoryEvents([]);
    setHistoryUnlinked(false);
    setHistoryLoading(false);
  }, [submission.id]);

`,
      "",
    );
  }

  // Logo preview: reset load error via remount key instead of effect
  if (file.endsWith("OrganizationSettingsEditor.tsx")) {
    next = next.replace(
      `  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoadError(false);
  }, [src]);

  return (`,
      `  const [loadError, setLoadError] = useState(false);

  return (`,
    );

    next = next.replace(
      "<img\n          src={src}",
      "<img\n          key={src}\n          src={src}",
    );

    next = next.replace(
      `  useEffect(() => {
    if (settingsLoading) return;
    const mergedBranding = initialRow
      ? mergeBranding(initialRow.branding as unknown as Record<string, unknown>)
      : getDefaultSettings().branding;
    const mergedFeatures = initialRow
      ? mergeFeatures(initialRow.features as unknown as Record<string, unknown>)
      : getDefaultSettings().features;

    setHasRow(!!initialRow);
    setBranding(mergedBranding);
    setFeatures(mergedFeatures);
    setSavedSnapshot(
      serializeSettings(
        mergedBranding,
        mergedFeatures as unknown as Record<string, unknown>,
      ),
    );
    setSaveMessage(null);
    setError(null);
    setLogoOpen(Boolean(mergedBranding.logo?.src?.trim()));
    setActiveFeaturePortal("admin");
  }, [organizationId, initialRow, settingsLoading]);`,
      `  useEffect(() => {
    if (settingsLoading) return;
    queueMicrotask(() => {
      const mergedBranding = initialRow
        ? mergeBranding(initialRow.branding as unknown as Record<string, unknown>)
        : getDefaultSettings().branding;
      const mergedFeatures = initialRow
        ? mergeFeatures(initialRow.features as unknown as Record<string, unknown>)
        : getDefaultSettings().features;

      setHasRow(!!initialRow);
      setBranding(mergedBranding);
      setFeatures(mergedFeatures);
      setSavedSnapshot(
        serializeSettings(
          mergedBranding,
          mergedFeatures as unknown as Record<string, unknown>,
        ),
      );
      setSaveMessage(null);
      setError(null);
      setLogoOpen(Boolean(mergedBranding.logo?.src?.trim()));
      setActiveFeaturePortal("admin");
    });
  }, [organizationId, initialRow, settingsLoading]);`,
    );
  }

  return next;
}

let changed = 0;
for (const file of srcFiles) {
  const before = fs.readFileSync(file, "utf8");
  const after = apply(before, file);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
    console.log("updated", path.relative(root, file));
  }
}
console.log(`Done. Updated ${changed} files.`);
