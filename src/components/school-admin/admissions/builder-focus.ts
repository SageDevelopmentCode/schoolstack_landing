export type BuilderFocus =
  | { kind: "setup" }
  | { kind: "step"; stepId: string }
  | { kind: "field"; stepId: string; fieldId: string }
  | { kind: "fee" }
  | { kind: "acknowledgments" };

export function focusKey(focus: BuilderFocus): string {
  switch (focus.kind) {
    case "setup":
      return "setup";
    case "fee":
      return "fee";
    case "acknowledgments":
      return "acknowledgments";
    case "step":
      return `step:${focus.stepId}`;
    case "field":
      return `field:${focus.stepId}:${focus.fieldId}`;
  }
}

export const DEFAULT_BUILDER_FOCUS: BuilderFocus = { kind: "setup" };
