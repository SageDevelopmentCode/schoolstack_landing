import type { FreeToolsHubStageId } from "@/lib/marketing/free-tools-hub-content";

export type FreeToolsStageSurface = {
  sectionClassName: string;
  cardClassName: string;
  flowNodeAccent: string;
};

export const FREE_TOOLS_STAGE_SURFACES: Record<
  FreeToolsHubStageId,
  FreeToolsStageSurface
> = {
  prospective_family: {
    sectionClassName: "bg-[#FAF0E4]",
    cardClassName: "border-[#E5D4BC] bg-white",
    flowNodeAccent: "#B8864A",
  },
  applying_family: {
    sectionClassName: "bg-[#DCEEF5]",
    cardClassName: "border-[#A8CEDD] bg-white",
    flowNodeAccent: "#39788C",
  },
  accepted_enrolling: {
    sectionClassName: "bg-[#C8E8D0]",
    cardClassName: "border-[#9ECFAD] bg-white",
    flowNodeAccent: "#3A7A52",
  },
  enrolled: {
    sectionClassName: "bg-[#E2E8D4]",
    cardClassName: "border-[#C4CEB0] bg-white",
    flowNodeAccent: "#6B7A4A",
  },
  staff: {
    sectionClassName: "bg-[#E2E0F0]",
    cardClassName: "border-[#C4C0D8] bg-white",
    flowNodeAccent: "#6B6594",
  },
  founder_admin: {
    sectionClassName: "bg-[#B8DCC0]",
    cardClassName: "border-[#8FB89A] bg-[#FCFDFB]",
    flowNodeAccent: "#315E4F",
  },
};
