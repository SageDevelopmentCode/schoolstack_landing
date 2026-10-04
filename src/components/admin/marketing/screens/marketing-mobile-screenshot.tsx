/* eslint-disable @next/next/no-img-element -- Marketing PNG export needs plain img, not next/image. */

type MarketingMobileScreenshotProps = {
  src: string;
  alt: string;
};

/** App screen capture aligned to top; phone chrome (island, home bar) lives in MobilePhoneFrame. */
export function MarketingMobileScreenshot({ src, alt }: MarketingMobileScreenshotProps) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "top center",
        display: "block",
      }}
    />
  );
}
