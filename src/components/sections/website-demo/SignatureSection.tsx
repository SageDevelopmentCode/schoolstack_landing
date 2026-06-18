"use client";

import type { DemoSignatureSection } from "@/data/school-demos/types";
import LearningModesSection from "./LearningModesSection";
import FruitsOfSpiritSection from "./FruitsOfSpiritSection";
import NatureArtJoySection from "./NatureArtJoySection";
import HybridRhythmSection from "./HybridRhythmSection";
import ValuePillarsSection from "./ValuePillarsSection";
import PhilosophyQuoteSection from "./PhilosophyQuoteSection";
import FarmExperienceSection from "./FarmExperienceSection";

interface Props {
  section: DemoSignatureSection;
  onCtaClick: () => void;
}

export default function SignatureSection({ section, onCtaClick }: Props) {
  switch (section.type) {
    case "learningModes":
      return <LearningModesSection section={section} />;
    case "fruitsOfSpirit":
      return <FruitsOfSpiritSection section={section} />;
    case "natureArtJoy":
      return <NatureArtJoySection section={section} />;
    case "hybridRhythm":
      return <HybridRhythmSection section={section} />;
    case "valuePillars":
      return <ValuePillarsSection section={section} />;
    case "philosophyQuote":
      return <PhilosophyQuoteSection section={section} onCtaClick={onCtaClick} />;
    case "farmExperience":
      return <FarmExperienceSection section={section} />;
    default:
      return null;
  }
}
