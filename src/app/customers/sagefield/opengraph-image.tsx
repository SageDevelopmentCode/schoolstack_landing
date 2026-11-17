import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Sage Field Case Study — MudKitchen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const photoData = await readFile(
    join(process.cwd(), "public/images/sagefield/classroom-main.jpg"),
  );
  const photoSrc = `data:image/jpeg;base64,${photoData.toString("base64")}`;

  // Garden palette: cream paper, ink type, a taped polaroid. Text unchanged.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: "#F7F1E7",
          backgroundImage: "radial-gradient(rgba(43,36,29,0.12) 1.4px, transparent 1.4px)",
          backgroundSize: "26px 26px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: "640px" }}>
          <p
            style={{
              display: "flex",
              alignSelf: "flex-start",
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#7E4533",
              backgroundColor: "#F8DDCF",
              borderRadius: "999px",
              padding: "8px 20px",
              margin: 0,
            }}
          >
            Customer Story
          </p>
          <p
            style={{
              fontSize: "60px",
              fontWeight: 800,
              color: "#2B241D",
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              margin: "24px 0 0",
            }}
          >
            Sage Field: 0 to 35 students in under 3 months
          </p>
          <p
            style={{
              display: "flex",
              fontSize: "26px",
              fontWeight: 600,
              color: "#2E4A3C",
              margin: "24px 0 0",
            }}
          >
            Powered by MudKitchen · Round Rock, TX
          </p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            backgroundColor: "#ffffff",
            padding: "14px 14px 44px",
            borderRadius: "8px",
            transform: "rotate(4deg)",
            boxShadow: "0 24px 50px -20px rgba(43,36,29,0.55)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-16px",
              left: "120px",
              width: "110px",
              height: "32px",
              backgroundColor: "#FFE58A",
              opacity: 0.9,
              transform: "rotate(-4deg)",
            }}
          />
          <img src={photoSrc} alt="" width={330} height={420} style={{ width: "330px", height: "420px", objectFit: "cover", borderRadius: "4px" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
