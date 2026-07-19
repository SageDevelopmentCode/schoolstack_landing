import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "MudKitchen — The complete operating system for microschools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoData = await readFile(
    join(process.cwd(), "public/images/favicon-32.png"),
  );
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a3327",
          padding: "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt=""
            width={80}
            height={80}
            style={{ objectFit: "contain" }}
          />
          <span
            style={{
              fontSize: "64px",
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            MudKitchen
          </span>
        </div>
        <p
          style={{
            fontSize: "32px",
            color: "rgba(255,255,255,0.75)",
            textAlign: "center",
            maxWidth: "860px",
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          The complete operating system for microschools
        </p>
        <p
          style={{
            fontSize: "22px",
            color: "rgba(255,255,255,0.45)",
            textAlign: "center",
            maxWidth: "760px",
            lineHeight: 1.5,
            marginTop: "24px",
          }}
        >
          Enrollment · Billing · Parent communication · Daily operations
        </p>
      </div>
    ),
    { ...size },
  );
}
