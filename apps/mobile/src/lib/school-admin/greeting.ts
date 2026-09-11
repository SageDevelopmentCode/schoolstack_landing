export function greetingParts(): { prefix: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { prefix: 'Good morning', emoji: '☀️' };
  if (hour < 17) return { prefix: 'Good afternoon', emoji: '🌤️' };
  return { prefix: 'Good evening', emoji: '🌙' };
}

export function userFirstNameFromMetadata(
  user: { user_metadata?: Record<string, unknown>; email?: string | null } | null,
): string | null {
  if (!user) return null;
  const firstName = user.user_metadata?.first_name;
  if (typeof firstName === 'string' && firstName.trim()) {
    return firstName.trim();
  }
  const fullName = user.user_metadata?.full_name;
  if (typeof fullName === 'string' && fullName.trim()) {
    const part = fullName.trim().split(/\s+/)[0];
    if (part) return part;
  }
  const emailPrefix = user.email?.split('@')[0]?.trim();
  return emailPrefix || null;
}
