"use client";

import { Fragment, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ClipboardList,
  CreditCard,
  Heart,
  MessageCircle,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCommitteeById } from "@/data/school-demos/rooted-meadows-committees";
import type { CommitteeWorkspaceSection } from "@/data/school-demos/rooted-meadows-committees";
import CommitteeWorkspaceShell from "@/components/demo/rootedmeadows/committees/CommitteeWorkspaceShell";
import {
  RootedMeadowsParentBillingMobilePreview,
  RootedMeadowsParentMessagesMobilePreview,
} from "@/components/demo/rootedmeadows/RootedMeadowsParentDashboardDemo";
import {
  RootedMeadowsTeacherAttendanceMobilePreview,
  RootedMeadowsTeacherStudentsMobilePreview,
} from "@/components/demo/rootedmeadows/RootedMeadowsTeacherDashboardDemo";
import MobilePhoneFrame from "./MobilePhoneFrame";

type MobileSlide = {
  id: string;
  label: string;
  shortLabel: string;
  caption: string;
  icon: LucideIcon;
  audience: "parent" | "teacher";
  render: () => React.ReactNode;
};

const PARENT_SLIDES: MobileSlide[] = [
  {
    id: "parent-messages",
    label: "Parent messages",
    shortLabel: "Messages",
    caption: "Message teachers from anywhere",
    icon: MessageCircle,
    audience: "parent",
    render: () => <RootedMeadowsParentMessagesMobilePreview />,
  },
  {
    id: "parent-tuition",
    label: "Tuition",
    shortLabel: "Tuition",
    caption: "Pay tuition in a few taps",
    icon: CreditCard,
    audience: "parent",
    render: () => <RootedMeadowsParentBillingMobilePreview />,
  },
  {
    id: "parent-committee",
    label: "Committees",
    shortLabel: "Committees",
    caption: "Stay connected with your committee",
    icon: Heart,
    audience: "parent",
    render: () => <ParentCommitteeMobilePreview />,
  },
];

const TEACHER_SLIDES: MobileSlide[] = [
  {
    id: "teacher-attendance",
    label: "Attendance",
    shortLabel: "Attendance",
    caption: "Take attendance one day at a time",
    icon: ClipboardList,
    audience: "teacher",
    render: () => <RootedMeadowsTeacherAttendanceMobilePreview />,
  },
  {
    id: "teacher-students",
    label: "Student profiles",
    shortLabel: "Students",
    caption: "Look up learning profiles and family contacts on the go",
    icon: Users,
    audience: "teacher",
    render: () => <RootedMeadowsTeacherStudentsMobilePreview />,
  },
];

const SLIDES = [...PARENT_SLIDES, ...TEACHER_SLIDES];

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
    <div className="flex h-full w-full flex-col items-center justify-center px-2 py-6">
      <div className="mb-5 flex w-full items-stretch gap-2">
        {SLIDES.map((item, index) => {
          const Icon = item.icon;
          return (
            <Fragment key={item.id}>
              {index === PARENT_SLIDES.length && (
                <div
                  className="w-px shrink-0 self-center h-9 bg-gray-200"
                  aria-hidden
                />
              )}
              <button
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Show ${item.label}`}
                aria-current={activeSlide === index ? "true" : undefined}
                className={`flex flex-1 min-w-0 flex-col items-center justify-center gap-0.5 min-h-[52px] rounded-xl px-1.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  activeSlide === index
                    ? "bg-[#827096] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-[#827096]/30 hover:text-[#827096]"
                }`}
              >
                <span className="flex items-center gap-1">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="leading-tight truncate">{item.shortLabel}</span>
                </span>
                <span
                  className={`text-[9px] font-medium uppercase tracking-wide leading-none ${
                    activeSlide === index ? "text-white/70" : "text-gray-400"
                  }`}
                >
                  {item.audience === "parent" ? "Parent" : "Teacher"}
                </span>
              </button>
            </Fragment>
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
