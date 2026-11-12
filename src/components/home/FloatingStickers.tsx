"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Globe,
  Mail,
  MessageSquare,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { DemoStageKey } from "./DemoStage";

export type Sticker = {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  color: string;
};

const PARENT_STICKERS: [Sticker, Sticker] = [
  { id: "p1", icon: CreditCard, title: "Tuition paid", subtitle: "October \u00b7 autopay", color: "#059669" },
  { id: "p2", icon: MessageSquare, title: "New message", subtitle: "From Ms. Rivera", color: "#0284C7" },
];

const TEACHER_STICKERS: [Sticker, Sticker] = [
  { id: "t1", icon: CalendarCheck, title: "Attendance logged", subtitle: "14 of 15 present", color: "#10b981" },
  { id: "t2", icon: MessageSquare, title: "Parent replied", subtitle: "Field trip form", color: "#0284C7" },
];

/** Sample notifications that echo what each demo surface does. */
export const STICKERS_BY_DEMO: Record<DemoStageKey, [Sticker, Sticker]> = {
  parent: PARENT_STICKERS,
  teacher: TEACHER_STICKERS,
  admin: [
    { id: "a1", icon: UserPlus, title: "New application", subtitle: "Grade 2 \u00b7 Fall", color: "#f97316" },
    { id: "a2", icon: CheckCircle2, title: "Enrollment complete", subtitle: "All forms signed", color: "#4A6B52" },
  ],
  website: [
    { id: "w1", icon: Globe, title: "Tour booked", subtitle: "From your website", color: "#A05C45" },
    { id: "w2", icon: UserPlus, title: "New inquiry", subtitle: "Kindergarten", color: "#f97316" },
  ],
  enrollment: [
    { id: "e1", icon: ClipboardCheck, title: "Packet signed", subtitle: "Enrollment agreement", color: "#4F46E5" },
    { id: "e2", icon: CheckCircle2, title: "Checklist done", subtitle: "Health + emergency", color: "#059669" },
  ],
  tuition: [
    { id: "b1", icon: CreditCard, title: "Payment received", subtitle: "Paid on time", color: "#059669" },
    { id: "b2", icon: Mail, title: "Invoice sent", subtitle: "November tuition", color: "#7C3AED" },
  ],
  attendance: [
    { id: "at1", icon: CalendarCheck, title: "Attendance saved", subtitle: "Morning check-in", color: "#10b981" },
    { id: "at2", icon: CheckCircle2, title: "Pickup confirmed", subtitle: "Authorized contact", color: "#4A6B52" },
  ],
  timeclock: [
    { id: "tc1", icon: CheckCircle2, title: "Clocked in", subtitle: "7:58 AM", color: "#10b981" },
    { id: "tc2", icon: CalendarCheck, title: "Weekly hours", subtitle: "Ready for review", color: "#0D9488" },
  ],
  marketing: [
    { id: "m1", icon: Mail, title: "Campaign sent", subtitle: "Open house invite", color: "#f97316" },
    { id: "m2", icon: UserPlus, title: "Lead nurtured", subtitle: "Tour scheduled", color: "#A05C45" },
  ],
  messages: [PARENT_STICKERS[1], TEACHER_STICKERS[1]],
};

type FloatingStickersProps = {
  stickers: [Sticker, Sticker];
  /** Positioning classes for the first and second sticker. */
  positions?: [string, string];
};

const DEFAULT_POSITIONS: [string, string] = [
  "-left-6 top-16 xl:-left-14",
  "-right-6 bottom-20 xl:-right-14",
];

export default function FloatingStickers({
  stickers,
  positions = DEFAULT_POSITIONS,
}: FloatingStickersProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 z-30 hidden lg:block" aria-hidden="true">
      <AnimatePresence mode="popLayout">
        {stickers.map((sticker, i) => {
          const Icon = sticker.icon;
          return (
            <motion.div
              key={sticker.id}
              className={`absolute ${positions[i]}`}
              initial={{ opacity: 0, y: 16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.18 }}
            >
              <motion.div
                animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-[0_18px_40px_rgba(30,40,30,0.16)] border border-black/5 bg-white text-text`}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${sticker.color}1f`, color: sticker.color }}
                >
                  <Icon size={18} />
                </span>
                <span className="flex flex-col">
                  <span className="font-secondary text-[13px] font-semibold leading-tight">
                    {sticker.title}
                  </span>
                  <span
                    className={`font-secondary text-[11px] leading-tight text-text-muted`}
                  >
                    {sticker.subtitle}
                  </span>
                </span>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
