export function buildGoogleMapsSearchUrl(address: string): string {
  const query = encodeURIComponent(address.trim());
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function buildAppleMapsAddressUrl(address: string): string {
  const addressParam = encodeURIComponent(address.trim());
  return `https://maps.apple.com/?address=${addressParam}`;
}
