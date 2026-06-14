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

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#1a3327",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoData as unknown as string}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.35,
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            width: "100%",
            height: "100%",
            padding: "64px",
            background:
              "linear-gradient(to top, rgba(26,51,39,0.95) 0%, rgba(26,51,39,0.4) 60%, transparent 100%)",
          }}
        >
          <p
            style={{
              fontSize: "18px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              margin: 0,
            }}
          >
            Customer Story
          </p>
          <p
            style={{
              fontSize: "56px",
              fontWeight: 600,
              color: "#ffffff",
              lineHeight: 1.1,
              margin: "12px 0 0",
              maxWidth: "900px",
            }}
          >
            Sage Field: 0 to 25 students in under 3 months
          </p>
          <p
            style={{
              fontSize: "24px",
              color: "rgba(255,255,255,0.65)",
              margin: "16px 0 0",
            }}
          >
            Powered by MudKitchen · Round Rock, TX
          </p>
        </div>
      </div>
    ),
    { ...size },
  );
}
