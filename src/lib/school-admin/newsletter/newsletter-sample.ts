import {
  createEditionFromTemplate,
  defaultSchoolTemplate,
} from "./newsletter-template";
import {
  createNewsletterId,
  type NewsletterEdition,
  type NewsletterSchoolTemplate,
  type NewsletterWorkspaceState,
} from "./newsletter-types";

export function createBlankEdition(
  template: NewsletterSchoolTemplate,
  week = "2026-10-26",
): NewsletterEdition {
  return createEditionFromTemplate(template, { week });
}

function setBlockValue(
  edition: NewsletterEdition,
  kind: NewsletterEdition["storyBlocks"][number]["kind"],
  value: string,
): void {
  const block = edition.storyBlocks.find((b) => b.kind === kind);
  if (block) block.value = value;
}

export function createSampleEdition(
  schoolName: string,
  primaryColor: string,
  template?: NewsletterSchoolTemplate,
): NewsletterWorkspaceState {
  const schoolTemplate = template ?? defaultSchoolTemplate();
  const edition = createBlankEdition(schoolTemplate, "2026-10-26");
  edition.title = "A week of small discoveries";
  setBlockValue(
    edition,
    "welcome",
    "Dear families,\n\nA little curiosity took us a long way this week. Here are a few moments from our school days together.",
  );
  setBlockValue(edition, "learning", "patterns in fallen leaves and the shapes we find outside");
  setBlockValue(
    edition,
    "moment",
    "A small group made a leaf museum along the garden path. They sorted their finds, made signs, and invited friends to look closely.",
  );
  setBlockValue(edition, "next", "measuring and comparing the trees around our gathering space");
  setBlockValue(
    edition,
    "family",
    "On your next walk, choose two leaves. What is the same? What is different? Let your child tell you what they notice.",
  );
  edition.events = [
    {
      id: createNewsletterId(),
      title: "Family garden morning",
      date: "2026-10-30",
      time: "9:00 AM",
      note: "Bring a water bottle and join us by the garden gate.",
    },
  ];
  edition.reminders = [
    {
      id: createNewsletterId(),
      text: "Please send a labeled water bottle and a change of clothes.",
      keep: true,
    },
    {
      id: createNewsletterId(),
      text: "A light layer helps with our cooler mornings outdoors.",
      keep: false,
    },
  ];

  return {
    school: {
      name: schoolName,
      signature: "With warmth,\nYour school team",
      primary: primaryColor,
    },
    template: schoolTemplate,
    editions: [edition],
    activeEditionId: edition.id,
  };
}
