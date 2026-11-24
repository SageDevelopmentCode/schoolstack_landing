import "server-only";
import QRCode from "qrcode";

/** The QR code for a letter's short link, as an inline SVG string (black on transparent, no quiet zone). */
export async function letterQrSvg(url: string): Promise<string> {
  return QRCode.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 0, color: { dark: "#2b241d", light: "#0000" } });
}
