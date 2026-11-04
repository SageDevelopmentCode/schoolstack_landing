import {
  tabPanelTransition,
  tabPanelVariants,
} from "@/lib/school-admin/admin-modal-motion";
import { myHoursRowTransition } from "@/lib/school-teacher/my-hours/my-hours-motion";

export function staffHoursViewPanelMotion(reducedMotion: boolean) {
  return {
    variants: tabPanelVariants(reducedMotion),
    transition: tabPanelTransition(reducedMotion),
  };
}

export function staffHoursExpandRowMotion(reducedMotion: boolean) {
  return myHoursRowTransition(reducedMotion);
}

export function staffHoursMetricCardMotion(
  reducedMotion: boolean,
  index: number,
) {
  if (reducedMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      transition: { duration: 0 },
    };
  }
  return {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.18, delay: index * 0.04 },
  };
}
