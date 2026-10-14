export type DemoTeacherUpdateLibraryItem = {
  id: string;
  teacherId: string;
  teacherName: string;
  initials: string;
  photoUrl?: string;
  studentName: string;
  studentPhotoUrl: string;
  dayKey: string;
  dayHeading: string;
  submittedLabel: string;
  preview: string;
  body: string;
  alreadyInNewsletter?: boolean;
};

const STAFF = "/images/people/staff";
const STUDENTS = "/images/people/students";

/** Thumb URLs for demo students (see public/images/people/students). */
export const DEMO_STUDENT_PHOTO_BY_NAME: Record<string, string> = {
  "Noah Chen": `${STUDENTS}/izzy-park-8hBY-30cEqI-unsplash-thumb.webp`,
  "Emma Rivera": `${STUDENTS}/cristina-anne-costello-i8n-TbgzSUE-unsplash-thumb.webp`,
  "Ava Brooks": `${STUDENTS}/ben-mullins-je240KkJIuA-unsplash-thumb.webp`,
  "Sophia Nguyen": `${STUDENTS}/aditya-sethia-y9se00qtzd4-unsplash-thumb.webp`,
  "Zoe Hart": `${STUDENTS}/patrick-hauth-K6p0llhyvP8-unsplash-thumb.webp`,
  "Mason Foster": `${STUDENTS}/thomas-park-qnFFfsrxzIk-unsplash-thumb.webp`,
};

export function studentInitialsFromName(studentName: string): string {
  const parts = studentName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
  }
  return studentName.slice(0, 2).toUpperCase();
}

const TEACHER_TAB_ORDER = ["sam", "priya", "chris"] as const;

const MON = { dayKey: "2025-10-13", dayHeading: "Monday, Oct 13" };
const TUE = { dayKey: "2025-10-14", dayHeading: "Tuesday, Oct 14" };
const WED = { dayKey: "2025-10-15", dayHeading: "Wednesday, Oct 15" };
const THU = { dayKey: "2025-10-16", dayHeading: "Thursday, Oct 16" };
const FRI = { dayKey: "2025-10-17", dayHeading: "Friday, Oct 17" };

/** Updates submitted via MudKitchen Teacher Updates — browse per student in the newsletter demo. */
export const DEMO_NEWSLETTER_TEACHER_UPDATE_LIBRARY: DemoTeacherUpdateLibraryItem[] = [
  {
    id: "sam-week-9-noah",
    teacherId: "sam",
    teacherName: "Sam Okonkwo",
    initials: "SO",
    photoUrl: `${STAFF}/andre-styles-pq9npYMirk8-unsplash.jpg`,
    studentName: "Noah Chen",
    studentPhotoUrl: DEMO_STUDENT_PHOTO_BY_NAME["Noah Chen"],
    ...MON,
    submittedLabel: "Submitted Mon · Oct 13",
    preview: "Leaf sorting, watercolor creek maps, and a north-loop hike with bark sketches…",
    body:
      "We finished our leaf sorting project and started watercolor maps of the creek trail. Ask your child which colors they mixed for the water. On Thursday we hiked the north loop and sketched bark textures—several students added compass roses to their maps. Next week we will press leaves for a classroom collage.",
    alreadyInNewsletter: true,
  },
  {
    id: "priya-week-9-emma",
    teacherId: "priya",
    teacherName: "Priya Nair",
    initials: "PN",
    photoUrl: `${STAFF}/clay-elliot-mpDV4xaFP8c-unsplash.jpg`,
    studentName: "Emma Rivera",
    studentPhotoUrl: DEMO_STUDENT_PHOTO_BY_NAME["Emma Rivera"],
    ...MON,
    submittedLabel: "Submitted Mon · Oct 13",
    preview: "Partner plays, fluent phrases, and new vocabulary journals heading home…",
    body:
      "Readers practiced fluent phrases with partner plays. Several students volunteered to perform on Friday. We also introduced a new vocabulary journal; look for three highlighted words in the take-home folder. Please encourage a five-minute read-aloud at home if you can—many kids are proud of their expression this week.",
    alreadyInNewsletter: true,
  },
  {
    id: "sam-week-9-ava",
    teacherId: "sam",
    teacherName: "Sam Okonkwo",
    initials: "SO",
    photoUrl: `${STAFF}/andre-styles-pq9npYMirk8-unsplash.jpg`,
    studentName: "Ava Brooks",
    studentPhotoUrl: DEMO_STUDENT_PHOTO_BY_NAME["Ava Brooks"],
    ...TUE,
    submittedLabel: "Submitted Tue · Oct 14",
    preview: "Compass work on the trail, pressed-leaf samples, and a creek watercolor study…",
    body:
      "Ava led our compass practice on the north loop and helped classmates label north on their trail maps. We collected three leaf types for pressing and she chose warm tones for her creek watercolor. Ask her which landmark she used as a reference point on the hike.",
  },
  {
    id: "priya-week-9-zoe",
    teacherId: "priya",
    teacherName: "Priya Nair",
    initials: "PN",
    photoUrl: `${STAFF}/clay-elliot-mpDV4xaFP8c-unsplash.jpg`,
    studentName: "Zoe Hart",
    studentPhotoUrl: DEMO_STUDENT_PHOTO_BY_NAME["Zoe Hart"],
    ...TUE,
    submittedLabel: "Submitted Tue · Oct 14",
    preview: "Reader’s theater rehearsal, expression coaching, and vocabulary highlights…",
    body:
      "Zoe practiced pacing and punctuation cues in our partner play and coached a classmate on a tricky dialogue line. Her vocabulary journal includes three words about character feelings. She is excited to perform on Friday if schedules allow.",
  },
  {
    id: "chris-week-9-zoe-mon",
    teacherId: "chris",
    teacherName: "Chris Alvarez",
    initials: "CA",
    photoUrl: `${STAFF}/tony-luginsland-OswNOXPNU1k-unsplash.jpg`,
    studentName: "Zoe Hart",
    studentPhotoUrl: DEMO_STUDENT_PHOTO_BY_NAME["Zoe Hart"],
    ...MON,
    submittedLabel: "Submitted Mon · Oct 13",
    preview: "Place-value games, mental math warm-ups, and a graphing survey about favorite trail snacks…",
    body:
      "Zoe organized our place-value card sort and recorded classmates’ votes for a trail-snack survey. She labeled the axes on her bar graph without prompting. Ask her which snack category had the closest race between first and second place.",
  },
  {
    id: "chris-week-9-mason",
    teacherId: "chris",
    teacherName: "Chris Alvarez",
    initials: "CA",
    photoUrl: `${STAFF}/tony-luginsland-OswNOXPNU1k-unsplash.jpg`,
    studentName: "Mason Foster",
    studentPhotoUrl: DEMO_STUDENT_PHOTO_BY_NAME["Mason Foster"],
    ...TUE,
    submittedLabel: "Submitted Tue · Oct 14",
    preview: "Fraction towers, estimation games, and a group problem-solving challenge…",
    body:
      "We built fraction towers with cuisenaire rods and played estimation games with pantry items. Thursday’s group challenge asked teams to plan a mini budget for a field trip snack—lots of debate over whether grapes or crackers were the better buy. Ask your child which strategy they used to compare prices.",
  },
  {
    id: "chris-week-9-ava-tue",
    teacherId: "chris",
    teacherName: "Chris Alvarez",
    initials: "CA",
    photoUrl: `${STAFF}/tony-luginsland-OswNOXPNU1k-unsplash.jpg`,
    studentName: "Ava Brooks",
    studentPhotoUrl: DEMO_STUDENT_PHOTO_BY_NAME["Ava Brooks"],
    ...TUE,
    submittedLabel: "Submitted Tue · Oct 14",
    preview: "Number-line fractions, peer explanations, and a quick check on equivalent pairs…",
    body:
      "Ava placed fractions on an open number line and explained to a partner why two rod stacks matched. She caught her own mistake when labels did not line up and fixed them without help. Celebrate that revision if she shares her homework folder at home.",
  },
  {
    id: "sam-week-9-sophia",
    teacherId: "sam",
    teacherName: "Sam Okonkwo",
    initials: "SO",
    photoUrl: `${STAFF}/andre-styles-pq9npYMirk8-unsplash.jpg`,
    studentName: "Sophia Nguyen",
    studentPhotoUrl: DEMO_STUDENT_PHOTO_BY_NAME["Sophia Nguyen"],
    ...WED,
    submittedLabel: "Submitted Wed · Oct 15",
    preview: "Sorting leaves by vein pattern and building a classroom collage plan…",
    body:
      "Sophia grouped leaves by smooth vs. toothed edges and sketched a collage layout for our display board. She paired with a buddy to mix greens for the background wash. Next week she will help hang the finished piece in the hallway.",
  },
  {
    id: "sam-week-9-zoe",
    teacherId: "sam",
    teacherName: "Sam Okonkwo",
    initials: "SO",
    photoUrl: `${STAFF}/andre-styles-pq9npYMirk8-unsplash.jpg`,
    studentName: "Zoe Hart",
    studentPhotoUrl: DEMO_STUDENT_PHOTO_BY_NAME["Zoe Hart"],
    ...WED,
    submittedLabel: "Submitted Wed · Oct 15",
    preview: "Outdoor sketching, bark rubbings, and sharing map legends with the group…",
    body:
      "Zoe tried bark rubbings with crayon and tape and added a legend to her creek map so others could read her symbols. She shared her work at closing circle. Encourage her to point out one symbol on the map at home if you have time.",
  },
  {
    id: "priya-week-9-mason",
    teacherId: "priya",
    teacherName: "Priya Nair",
    initials: "PN",
    photoUrl: `${STAFF}/clay-elliot-mpDV4xaFP8c-unsplash.jpg`,
    studentName: "Mason Foster",
    studentPhotoUrl: DEMO_STUDENT_PHOTO_BY_NAME["Mason Foster"],
    ...WED,
    submittedLabel: "Submitted Wed · Oct 15",
    preview: "Fluency phrases, choral reading, and journal entries about story setting…",
    body:
      "Mason read with strong expression in choral reading and added a journal entry describing where his play takes place. He circled two vocabulary words to practice at home. A short read-aloud together would reinforce his confidence this week.",
  },
  {
    id: "priya-week-9-sophia-wed",
    teacherId: "priya",
    teacherName: "Priya Nair",
    initials: "PN",
    photoUrl: `${STAFF}/clay-elliot-mpDV4xaFP8c-unsplash.jpg`,
    studentName: "Sophia Nguyen",
    studentPhotoUrl: DEMO_STUDENT_PHOTO_BY_NAME["Sophia Nguyen"],
    ...WED,
    submittedLabel: "Submitted Wed · Oct 15",
    preview: "Character motivation notes, partner rehearsal, and vocabulary in context…",
    body:
      "Sophia annotated why her character changes by the final scene and coached a partner on pausing at commas. She used two new vocabulary words correctly in discussion. If you have a minute, ask her to perform one line with expression.",
  },
  {
    id: "chris-week-9-noah",
    teacherId: "chris",
    teacherName: "Chris Alvarez",
    initials: "CA",
    photoUrl: `${STAFF}/tony-luginsland-OswNOXPNU1k-unsplash.jpg`,
    studentName: "Noah Chen",
    studentPhotoUrl: DEMO_STUDENT_PHOTO_BY_NAME["Noah Chen"],
    ...WED,
    submittedLabel: "Submitted Wed · Oct 15",
    preview: "Cuisenaire fractions, number-line jumps, and snack-budget comparisons…",
    body:
      "Noah explained equivalent fractions using rods and placed fractions on a number line during small group. In the snack-budget challenge he argued for buying in bulk. Ask him to show you one fraction pair that matched his tower at home.",
  },
  {
    id: "chris-week-9-emma",
    teacherId: "chris",
    teacherName: "Chris Alvarez",
    initials: "CA",
    photoUrl: `${STAFF}/tony-luginsland-OswNOXPNU1k-unsplash.jpg`,
    studentName: "Emma Rivera",
    studentPhotoUrl: DEMO_STUDENT_PHOTO_BY_NAME["Emma Rivera"],
    ...WED,
    submittedLabel: "Submitted Wed · Oct 15",
    preview: "Estimation jars, recording guesses, and revising after counting…",
    body:
      "Emma recorded high and low estimates for classroom items and revised after we counted together. She led her table in comparing unit prices for crackers vs. grapes. She is proud of her revised estimate on the jar activity—celebrate that revision mindset if you can.",
  },
  {
    id: "priya-week-9-ava",
    teacherId: "priya",
    teacherName: "Priya Nair",
    initials: "PN",
    photoUrl: `${STAFF}/clay-elliot-mpDV4xaFP8c-unsplash.jpg`,
    studentName: "Ava Brooks",
    studentPhotoUrl: DEMO_STUDENT_PHOTO_BY_NAME["Ava Brooks"],
    ...THU,
    submittedLabel: "Submitted Thu · Oct 16",
    preview: "Final play run-through, peer feedback, and take-home word list…",
    body:
      "Ava incorporated peer feedback on volume and eye contact during our final rehearsal. She highlighted three vocabulary words in her folder and wrote one sentence about her character’s goal. Thank you for supporting the Friday performance if you can attend.",
  },
  {
    id: "chris-week-9-sophia",
    teacherId: "chris",
    teacherName: "Chris Alvarez",
    initials: "CA",
    photoUrl: `${STAFF}/tony-luginsland-OswNOXPNU1k-unsplash.jpg`,
    studentName: "Sophia Nguyen",
    studentPhotoUrl: DEMO_STUDENT_PHOTO_BY_NAME["Sophia Nguyen"],
    ...THU,
    submittedLabel: "Submitted Thu · Oct 16",
    preview: "Team budget presentation, fraction vocabulary, and reflection on strategies…",
    body:
      "Sophia’s team presented their snack budget and used words like numerator and denominator correctly. She reflected on which strategy helped most when prices did not divide evenly. Encourage her to teach a family member one fraction word she used this week.",
  },
  {
    id: "chris-week-9-mason-thu",
    teacherId: "chris",
    teacherName: "Chris Alvarez",
    initials: "CA",
    photoUrl: `${STAFF}/tony-luginsland-OswNOXPNU1k-unsplash.jpg`,
    studentName: "Mason Foster",
    studentPhotoUrl: DEMO_STUDENT_PHOTO_BY_NAME["Mason Foster"],
    ...THU,
    submittedLabel: "Submitted Thu · Oct 16",
    preview: "Snack-budget debrief, unit-price comparisons, and a written reflection…",
    body:
      "Mason defended his team’s cracker choice using unit price and wrote a short reflection on what he would try differently next time. He volunteered to read a fraction sentence aloud during share-out. Ask him which number he trusted most in the budget table.",
  },
  {
    id: "sam-week-9-emma-thu",
    teacherId: "sam",
    teacherName: "Sam Okonkwo",
    initials: "SO",
    photoUrl: `${STAFF}/andre-styles-pq9npYMirk8-unsplash.jpg`,
    studentName: "Emma Rivera",
    studentPhotoUrl: DEMO_STUDENT_PHOTO_BY_NAME["Emma Rivera"],
    ...THU,
    submittedLabel: "Submitted Thu · Oct 16",
    preview: "Collage assembly, glue-dot spacing, and a hallway display label…",
    body:
      "Emma helped arrange pressed leaves on the collage backing and wrote the display label explaining our creek study. She tested glue dots so leaves would lie flat. The finished board goes up Monday—she is proud of the title she chose.",
  },
  {
    id: "chris-week-9-noah-fri",
    teacherId: "chris",
    teacherName: "Chris Alvarez",
    initials: "CA",
    photoUrl: `${STAFF}/tony-luginsland-OswNOXPNU1k-unsplash.jpg`,
    studentName: "Noah Chen",
    studentPhotoUrl: DEMO_STUDENT_PHOTO_BY_NAME["Noah Chen"],
    ...FRI,
    submittedLabel: "Submitted Fri · Oct 17",
    preview: "Week-in-review math journal, fraction favorites, and goals for next week…",
    body:
      "Noah summarized two strategies that helped him this week—drawing rods and using a number line—and set a goal to explain equivalents without counting every piece. His journal entry is in the Friday folder if you want to read it together.",
  },
];

export type DemoTeacherUpdateTab = {
  id: string;
  label: string;
  count: number;
};

export type DemoTeacherUpdateDayGroup = {
  dayKey: string;
  dayHeading: string;
  items: DemoTeacherUpdateLibraryItem[];
};

export function groupDemoTeacherUpdatesByDay(
  items: DemoTeacherUpdateLibraryItem[],
): DemoTeacherUpdateDayGroup[] {
  const byDay = new Map<string, DemoTeacherUpdateDayGroup>();
  for (const item of items) {
    let group = byDay.get(item.dayKey);
    if (!group) {
      group = { dayKey: item.dayKey, dayHeading: item.dayHeading, items: [] };
      byDay.set(item.dayKey, group);
    }
    group.items.push(item);
  }
  return [...byDay.values()].sort((a, b) => a.dayKey.localeCompare(b.dayKey));
}

export function getDemoTeacherUpdateTabs(
  items: DemoTeacherUpdateLibraryItem[],
): DemoTeacherUpdateTab[] {
  const byTeacher = new Map<string, { label: string; count: number }>();
  for (const item of items) {
    const existing = byTeacher.get(item.teacherId);
    if (existing) {
      existing.count += 1;
    } else {
      byTeacher.set(item.teacherId, { label: item.teacherName, count: 1 });
    }
  }

  const teacherTabs: DemoTeacherUpdateTab[] = [];
  for (const teacherId of TEACHER_TAB_ORDER) {
    const entry = byTeacher.get(teacherId);
    if (entry) {
      teacherTabs.push({
        id: teacherId,
        label: entry.label,
        count: entry.count,
      });
    }
  }
  for (const [teacherId, entry] of byTeacher) {
    if (!TEACHER_TAB_ORDER.includes(teacherId as (typeof TEACHER_TAB_ORDER)[number])) {
      teacherTabs.push({ id: teacherId, label: entry.label, count: entry.count });
    }
  }

  return [
    { id: "all", label: "All teachers", count: items.length },
    ...teacherTabs,
  ];
}
