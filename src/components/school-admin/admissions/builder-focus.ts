export type BuilderFocus =
  | { kind: "setup" }
  | { kind: "step"; stepId: string }
  | { kind: "field"; stepId: string; fieldId: string }
  | { kind: "fee" }
  | { kind: "acknowledgments" }
  | { kind: "postSubmit" }
  | { kind: "review" };

export function focusKey(focus: BuilderFocus): string {
  switch (focus.kind) {
    case "setup":
      return "setup";
    // Fee and acknowledgments share the "Fees & agreements" stage, so moving
    // between them must not re-animate the canvas.
    case "fee":
    case "acknowledgments":
      return "payments";
    case "postSubmit":
      return "postSubmit";
    case "review":
      return "review";
    case "step":
      return `step:${focus.stepId}`;
    case "field":
      return `step:${focus.stepId}`;
  }
}

export const DEFAULT_BUILDER_FOCUS: BuilderFocus = { kind: "setup" };
