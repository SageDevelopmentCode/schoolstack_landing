export function isOutboundEmailDisabled(): boolean {
  const value = process.env.DISABLE_OUTBOUND_EMAIL;
  return value === "1" || value === "true";
}
