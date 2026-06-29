"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getCommitteeById } from "@/data/school-demos/rooted-meadows-committees";
import type { CommitteeWorkspaceSection } from "@/data/school-demos/rooted-meadows-committees";
import CommitteeWorkspaceShell from "@/components/demo/rootedmeadows/committees/CommitteeWorkspaceShell";
import { RootedMeadowsParentMessagesMobilePreview } from "@/components/demo/rootedmeadows/RootedMeadowsParentDashboardDemo";
import { RootedMeadowsTeacherAttendanceMobilePreview } from "@/components/demo/rootedmeadows/RootedMeadowsTeacherDashboardDemo";
import MobilePhoneFrame from "./MobilePhoneFrame";

const SLIDES = [
  {
    id: "parent-messages",
    label: "Parent messages",
    caption: "Message teachers from anywhere",
    render: () => <RootedMeadowsParentMessagesMobilePreview />,
  },
  {
    id: "teacher-attendance",
    label: "Attendance",
    caption: "Take attendance one day at a time",
    render: () => <RootedMeadowsTeacherAttendanceMobilePreview />,
  },
  {
    id: "parent-committee",
    label: "Committees",
    caption: "Stay connected with your committee",
    render: () => <ParentCommitteeMobilePreview />,
  },
] as const;

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
    <div className="flex h-full flex-col items-center justify-center px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
        {SLIDES.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setActiveSlide(index)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeSlide === index
                ? "bg-[#827096] text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:border-[#827096]/30 hover:text-[#827096]"
            }`}
          >
            {item.label}
          </button>
        ))}
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
