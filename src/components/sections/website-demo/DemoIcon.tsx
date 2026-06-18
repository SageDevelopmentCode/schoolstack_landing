import {
  Sprout,
  Heart,
  Palette,
  TreePine,
  Leaf,
  GraduationCap,
  Users,
  Compass,
  BookOpen,
  Shield,
  Award,
  Sparkles,
} from "lucide-react";
import type { DemoIconName } from "@/data/school-demos/types";

const ICON_MAP = {
  sprout: Sprout,
  heart: Heart,
  palette: Palette,
  treePine: TreePine,
  leaf: Leaf,
  graduationCap: GraduationCap,
  users: Users,
  compass: Compass,
  bookOpen: BookOpen,
  shield: Shield,
  award: Award,
  sparkles: Sparkles,
} as const;

export default function DemoIcon({
  name,
  className,
}: {
  name: DemoIconName;
  className?: string;
}) {
  const Icon = ICON_MAP[name];
  return <Icon className={className} />;
}
