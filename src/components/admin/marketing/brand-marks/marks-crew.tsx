"use client";

import { G } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import { mascotIconBackgrounds, renderMascotIconSvg } from "@/components/admin/marketing/mascot/storybook-art";
import { Art, BowlSticker, CENTER, darken, MascotSticker, Pattern, STAGE } from "@/components/admin/marketing/brand-marks/mark-kit";
import { CREW } from "@/components/admin/marketing/brand-marks/crew";
import { SQUARE_OUTPUT, SQUARE_STAGE, type BrandMark } from "@/components/admin/marketing/brand-marks/types";

const square = { stage: { w: SQUARE_STAGE, h: SQUARE_STAGE } };

export const CREW_MARKS: BrandMark[] = CREW.flatMap(({ name, label, feature, view, base, pattern, dark }) => {
  const shadow = dark ? "#16121F" : darken(base, 0.26);
  const avatar: BrandMark = {
    id: `crew-${name}`,
    title: label,
    description: `${label} (${feature}) as a sticker, with a little bowl.`,
    kind: "avatar",
    group: "crew",
    background: base,
    fileName: `crew-${name}.png`,
    width: SQUARE_OUTPUT.avatar,
    height: SQUARE_OUTPUT.avatar,
    ...square,
    render: () => (
      <>
        <Pattern kind={pattern} base={base} ink={dark ? "#3A3150" : undefined} />
        <MascotSticker name={name} view={view} cx={CENTER - 20} cy={510} width={640} tilt={-4} shadow={shadow} outlineColor={dark ? G.paper : undefined} />
        <BowlSticker cx={790} cy={800} width={220} tilt={10} shadow={shadow} outlineColor={dark ? G.paper : undefined} z={5} />
      </>
    ),
  };
  const [iconBg] = mascotIconBackgrounds(name);
  const icon: BrandMark = {
    id: `crew-${name}-icon`,
    title: label,
    description: `${label} (${feature}) app icon.`,
    kind: "app-icon",
    group: "crew",
    background: iconBg,
    fileName: `crew-${name}-app-icon.png`,
    width: SQUARE_OUTPUT["app-icon"],
    height: SQUARE_OUTPUT["app-icon"],
    ...square,
    render: () => <Art svg={renderMascotIconSvg(name, 0, { square: true })} x={CENTER} y={CENTER} w={STAGE} z={1} />,
  };
  return [avatar, icon];
});
