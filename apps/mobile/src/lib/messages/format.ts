const CONTACT_COLORS = [
  '#7FA888',
  '#827096',
  '#5E7C68',
  '#97C09B',
  '#4A6354',
  '#6B8CAE',
  '#B8860B',
] as const;

export function colorForKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash + key.charCodeAt(i) * (i + 1)) % CONTACT_COLORS.length;
  }
  return CONTACT_COLORS[hash] ?? CONTACT_COLORS[0];
}

export function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
}
