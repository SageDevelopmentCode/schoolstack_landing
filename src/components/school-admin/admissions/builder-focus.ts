export type BuilderFocus =
  | { kind: "setup" }
  | { kind: "step"; stepId: string }
  | { kind: "field"; stepId: string; fieldId: string }
  | { kind: "fee" }
  | { kind: "acknowledgments" }
  | { kind: "postSubmit" };

export function focusKey(focus: BuilderFocus): string {
  switch (focus.kind) {
    case "setup":
      return "setup";
    case "fee":
      return "fee";
    case "acknowledgments":
      return "acknowledgments";
    case "postSubmit":
      return "postSubmit";
    case "step":
      return `step:${focus.stepId}`;
    case "field":
      return `step:${focus.stepId}`;
  }
}

export const DEFAULT_BUILDER_FOCUS: BuilderFocus = { kind: "setup" };
