import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "..");

function collectFiles(dir, pattern, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) collectFiles(full, pattern, acc);
    else if (pattern.test(ent.name)) acc.push(full);
  }
  return acc;
}

const teacherFiles = [
  path.join(root, "src/components/sections/TeacherDashboardDemo.tsx"),
  ...collectFiles(path.join(root, "src/components/demo"), /TeacherDashboardDemo\.tsx$/),
];

function applyTeacher(content) {
  let next = content;

  next = next.replace(
    "  const [bannerIndex, setBannerIndex] = useState(0);\n",
    "  const [bannerIndex, setBannerIndex] = useState(() =>\n    Math.floor(Math.random() * BANNER_IMAGES.length),\n  );\n",
  );

  next = next.replace(
    `  useEffect(() => {
    setBannerIndex(Math.floor(Math.random() * BANNER_IMAGES.length));
    const timer = setInterval(() => {
      setBannerIndex((i) => (i + 1) % BANNER_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

`,
    `  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((i) => (i + 1) % BANNER_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

`,
  );

  next = next.replace(
    `  useEffect(() => {
    if (!typingTarget) return;
    setMsgDraft("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setMsgDraft(typingTarget.slice(0, i));
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
      setMsgDraft(typingTarget.slice(0, i));
      if (i >= typingTarget.length) {
        clearInterval(id);
        setTypingTarget(null);
      }
    }, 55);
    return () => {
      clearInterval(id);
      setMsgDraft("");
    };
  }, [typingTarget]);`,
  );

  next = next.replace(
    'action: () => setTypingTarget("Sure, let\'s reschedule for Thursday!"),',
    'action: () => {\n          setMsgDraft("");\n          setTypingTarget("Sure, let\'s reschedule for Thursday!");\n        },',
  );

  return next;
}

const adminExtras = collectFiles(path.join(root, "src/components/demo"), /AdminDashboardDemo\.tsx$/).concat(
  path.join(root, "src/components/sections/AdminDashboardDemo.tsx"),
);

function applyAdminExtras(content) {
  let next = content;

  next = next.replace(
    `  useEffect(() => {
    if (selectedFamilyId) {
      const match = ACTIVE_DEMO_FAMILIES.find((f) => f.id === selectedFamilyId);
      if (match) {
        setSelectedFamily(match);
        setOpenScheduleKey(null);
      }
    }
  }, [selectedFamilyId]);

`,
    "",
  );

  return next;
}

let changed = 0;
for (const file of [...teacherFiles, ...adminExtras]) {
  const before = fs.readFileSync(file, "utf8");
  const after = applyTeacher(applyAdminExtras(before));
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
    console.log("updated", path.relative(root, file));
  }
}
console.log(`Done. Updated ${changed} files.`);
