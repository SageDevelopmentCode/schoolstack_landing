export const MESSAGE_EMAIL_ACTIVE_READ_MINUTES = 15;
export const MESSAGE_EMAIL_COOLDOWN_MINUTES = 30;

export type MessageEmailDebounceInput = {
  now: Date;
  lastReadAt: string | null;
  lastEmailNotifiedAt: string | null;
};

export type MessageEmailDebounceResult = {
  send: boolean;
  reason?: "recently_active" | "email_cooldown";
};

export function isWithinMinutes(
  iso: string | null,
  minutes: number,
  now: Date,
): boolean {
  if (!iso) return false;

  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return false;

  const windowMs = minutes * 60 * 1000;
  return now.getTime() - timestamp < windowMs;
}

export function shouldSendMessageEmail(
  input: MessageEmailDebounceInput,
): MessageEmailDebounceResult {
  if (
    isWithinMinutes(
      input.lastReadAt,
      MESSAGE_EMAIL_ACTIVE_READ_MINUTES,
      input.now,
    )
  ) {
    return { send: false, reason: "recently_active" };
  }

  if (
    isWithinMinutes(
      input.lastEmailNotifiedAt,
      MESSAGE_EMAIL_COOLDOWN_MINUTES,
      input.now,
    )
  ) {
    return { send: false, reason: "email_cooldown" };
  }

  return { send: true };
}
