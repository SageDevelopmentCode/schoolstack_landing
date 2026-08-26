"use client";

import {
  ClipboardList,
  CreditCard,
  Inbox,
  MessageCircle,
  Users,
} from "lucide-react";
import AdminAdmissionsSubmissionsSlide from "./slides/AdminAdmissionsSubmissionsSlide";
import ParentMessagesSlide from "./slides/ParentMessagesSlide";
import ParentTuitionSlide from "./slides/ParentTuitionSlide";
import TeacherAttendanceSlide from "./slides/TeacherAttendanceSlide";
import TeacherStudentsSlide from "./slides/TeacherStudentsSlide";
import type { MobileShowcaseSlide } from "./types";

type MicroschoolMobileSlidesConfig = {
  accentColor: string;
  teacherName: string;
  teacherTitle?: string;
  schoolName?: string;
};

export function createMicroschoolMobileSlides({
  accentColor,
  teacherName,
  teacherTitle = "Lead Teacher",
  schoolName,
}: MicroschoolMobileSlidesConfig): MobileShowcaseSlide[] {
  const parentSlides: MobileShowcaseSlide[] = [
    {
      id: "parent-messages",
      label: "Parent messages",
      shortLabel: "Messages",
      caption: "Message teachers from anywhere",
      icon: MessageCircle,
      audience: "parent",
      render: () => (
        <ParentMessagesSlide
          accentColor={accentColor}
          teacherName={teacherName}
          teacherTitle={teacherTitle}
        />
      ),
    },
    {
      id: "parent-tuition",
      label: "Tuition",
      shortLabel: "Tuition",
      caption: "Pay tuition in a few taps",
      icon: CreditCard,
      audience: "parent",
      render: () => <ParentTuitionSlide accentColor={accentColor} />,
    },
  ];

  const adminSlides: MobileShowcaseSlide[] = [
    {
      id: "admin-admissions",
      label: "Admissions submissions",
      shortLabel: "Admissions",
      caption: "Review new inquiries on the go",
      icon: Inbox,
      audience: "admin",
      render: () => (
        <AdminAdmissionsSubmissionsSlide
          accentColor={accentColor}
          schoolName={schoolName}
        />
      ),
    },
  ];

  const teacherSlides: MobileShowcaseSlide[] = [
    {
      id: "teacher-attendance",
      label: "Attendance",
      shortLabel: "Attendance",
      caption: "Take attendance with present, pickup, and absent actions",
      icon: ClipboardList,
      audience: "teacher",
      render: () => <TeacherAttendanceSlide accentColor={accentColor} />,
    },
    {
      id: "teacher-students",
      label: "Student profiles",
      shortLabel: "Students",
      caption: "Look up learning profiles and family contacts on the go",
      icon: Users,
      audience: "teacher",
      render: () => <TeacherStudentsSlide accentColor={accentColor} />,
    },
  ];

  return [...parentSlides, ...adminSlides, ...teacherSlides];
}
