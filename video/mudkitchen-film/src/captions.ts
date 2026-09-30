// Burned-in captions for the VO. Each cue is at most two lines at caption size.
export type Cue = { from: number; to: number; text: string };

// One audio file per clip: public/audio/vo/<id>.mp3 (or .wav), mounted at `from`.
// `to` is the end of the clip's window (2 frames before the next clip starts);
// a longer file would talk over the next line.
// `read` is the TTS-friendly wording when it differs from the on-screen text.
export type VoClip = { id: string; from: number; to: number; text: string; read?: string };

const CLIPS: Omit<VoClip, "to">[] = [
  { id: "01", from: 2, text: "Too many tools." },
  { id: "02", from: 48, text: "Too many tabs." },
  { id: "03", from: 96, text: "Enrollment lives in forms." },
  { id: "04", from: 142, text: "Updates live in texts." },
  { id: "05", from: 186, text: "Records live in spreadsheets." },
  { id: "06", from: 240, text: "When your school runs in five different places..." },
  { id: "07", from: 313, text: "everything feels harder." },
  { id: "08", from: 368, text: "MudKitchen pulls it together." },
  { id: "09", from: 462, text: "Ten apps collapse into one workspace: enrollment, billing, messaging, calendar, files, and more." },
  { id: "10", from: 668, text: "School admins see admissions, students, and alerts in one command center." },
  { id: "11", from: 812, text: "Assign classrooms. Track tuition. See every dollar." },
  { id: "12", from: 1030, text: "Parents apply, upload, and sign forms, right from their phone." },
  { id: "13", from: 1190, text: "Tuition takes one tap. Messages, calendar, and forms live in one app, not buried in email." },
  { id: "14", from: 1390, text: "Teachers track students, attendance, and conversations, in a calmer day." },
  { id: "15", from: 1540, text: "One platform. Three portals. Built for microschools." },
  {
    id: "16",
    from: 1658,
    text: "MudKitchen. Book a demo at trymudkitchen.com/get-started.",
    read: "MudKitchen. Book a demo at try mud kitchen dot com slash get started.",
  },
];

const FILM_END = 1800;

export const VO_LINES: VoClip[] = CLIPS.map((c, i) => ({
  ...c,
  to: (i + 1 < CLIPS.length ? CLIPS[i + 1].from : FILM_END) - 2,
}));

export const CUES: Cue[] = [
  { from: 2, to: 46, text: "Too many tools." },
  { from: 48, to: 90, text: "Too many tabs." },
  { from: 96, to: 140, text: "Enrollment lives in forms." },
  { from: 142, to: 184, text: "Updates live in texts." },
  { from: 186, to: 234, text: "Records live in spreadsheets." },
  { from: 240, to: 311, text: "When your school runs in five different places —" },
  { from: 313, to: 352, text: "everything feels harder." },
  { from: 368, to: 444, text: "MudKitchen pulls it together." },
  { from: 462, to: 540, text: "Ten apps collapse into one workspace —" },
  { from: 540, to: 656, text: "enrollment, billing, messaging, calendar, files, and more." },
  { from: 668, to: 760, text: "School admins see admissions, students, and alerts" },
  { from: 760, to: 810, text: "in one command center." },
  { from: 812, to: 946, text: "Assign classrooms. Track tuition. See every dollar." },
  { from: 1030, to: 1188, text: "Parents apply, upload, and sign forms, right from their phone." },
  { from: 1190, to: 1237, text: "Tuition takes one tap." },
  { from: 1237, to: 1386, text: "Messages, calendar, and forms live in one app, not buried in email." },
  { from: 1390, to: 1480, text: "Teachers track students, attendance, and conversations —" },
  { from: 1480, to: 1538, text: "in a calmer day." },
  { from: 1540, to: 1598, text: "One platform. Three portals." },
  { from: 1598, to: 1656, text: "Built for microschools." },
  { from: 1658, to: 1796, text: "MudKitchen. Book a demo at trymudkitchen.com/get-started." },
];
