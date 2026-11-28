/**
 * IndexNow key file (https://www.indexnow.org). Bing reads it to confirm that URL submissions
 * from scripts/indexnow-submit.ts come from this site. 404 until INDEXNOW_KEY is set.
 */
export function GET() {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key) return new Response("Not found", { status: 404 });
  return new Response(key, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
