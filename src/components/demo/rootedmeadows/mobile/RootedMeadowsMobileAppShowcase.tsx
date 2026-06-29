"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ClipboardList,
  CreditCard,
  Heart,
  MessageCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCommitteeById } from "@/data/school-demos/rooted-meadows-committees";
import type { CommitteeWorkspaceSection } from "@/data/school-demos/rooted-meadows-committees";
import CommitteeWorkspaceShell from "@/components/demo/rootedmeadows/committees/CommitteeWorkspaceShell";
import {
  RootedMeadowsParentBillingMobilePreview,
  RootedMeadowsParentMessagesMobilePreview,
} from "@/components/demo/rootedmeadows/RootedMeadowsParentDashboardDemo";
import { RootedMeadowsTeacherAttendanceMobilePreview } from "@/components/demo/rootedmeadows/RootedMeadowsTeacherDashboardDemo";
import MobilePhoneFrame, { MOBILE_SHOWCASE_WIDTH } from "./MobilePhoneFrame";

const SLIDES: {
  id: string;
  label: string;
  shortLabel: string;
  caption: string;
  icon: LucideIcon;
  render: () => React.ReactNode;
}[] = [
  {
    id: "parent-messages",
    label: "Parent messages",
    shortLabel: "Messages",
    caption: "Message teachers from anywhere",
    icon: MessageCircle,
    render: () => <RootedMeadowsParentMessagesMobilePreview />,
  },
  {
    id: "parent-tuition",
    label: "Tuition",
    shortLabel: "Tuition",
    caption: "Pay tuition in a few taps",
    icon: CreditCard,
    render: () => <RootedMeadowsParentBillingMobilePreview />,
  },
  {
    id: "teacher-attendance",
    label: "Attendance",
    shortLabel: "Attendance",
    caption: "Take attendance one day at a time",
    icon: ClipboardList,
    render: () => <RootedMeadowsTeacherAttendanceMobilePreview />,
  },
  {
    id: "parent-committee",
    label: "Committees",
    shortLabel: "Committees",
    caption: "Stay connected with your committee",
    icon: Heart,
    render: () => <ParentCommitteeMobilePreview />,
  },
];

function ParentCommitteeMobilePreview() {
  const committee = getCommitteeById("service-sunshine-2025");
  const [activeSection, setActiveSection] =
    useState<CommitteeWorkspaceSection>("home");

  if (!committee) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Committee not found
      </div>
    );
  }

  return (
    <CommitteeWorkspaceShell
      committee={committee}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      currentUserId="m-ss-sarah"
      compact
    />
  );
}

export default function RootedMeadowsMobileAppShowcase() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = SLIDES[activeSlide];

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4 py-6">
      <div
        className="mb-5 grid w-full grid-cols-4 gap-2.5"
        style={{ maxWidth: MOBILE_SHOWCASE_WIDTH }}
      >
        {SLIDES.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`Show ${item.label}`}
              aria-current={activeSlide === index ? "true" : undefined}
              className={`flex flex-row items-center justify-center gap-1.5 min-h-[48px] rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                activeSlide === index
                  ? "bg-[#827096] text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#827096]/30 hover:text-[#827096]"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="leading-tight whitespace-nowrap">{item.shortLabel}</span>
            </button>
          );
        })}
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <MobilePhoneFrame>{slide.render()}</MobilePhoneFrame>
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-4 text-sm text-gray-500 text-center">{slide.caption}</p>

      <div className="mt-3 flex items-center gap-2">
        {SLIDES.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveSlide(index)}
            aria-label={`Show ${item.label}`}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              activeSlide === index ? "w-5 bg-[#827096]" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
