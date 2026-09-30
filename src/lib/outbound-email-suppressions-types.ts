export type OutboundEmailSuppressionRow = {
  email: string;
  status: "unsubscribed" | "whitelisted";
  unsubscribed_at: string | null;
  whitelisted_at: string | null;
  source: "link" | "admin";
  notes: string | null;
  updated_at: string;
  created_at: string;
};
