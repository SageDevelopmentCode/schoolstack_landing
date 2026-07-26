import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addMarkdownSubsectionBreaks, applyMarkdownFormat } from "./markdown-textarea";

describe("applyMarkdownFormat", () => {
  it("wraps a selection in bold markers", () => {
    const result = applyMarkdownFormat("Hello world", 6, 11, "bold");
    assert.equal(result.nextValue, "Hello **world**");
    assert.equal(result.nextSelectionStart, 8);
    assert.equal(result.nextSelectionEnd, 13);
  });

  it("inserts a heading prefix on the current line", () => {
    const result = applyMarkdownFormat("Title line\nNext", 0, 0, "heading2");
    assert.equal(result.nextValue, "## Title line\nNext");
    assert.equal(result.nextSelectionStart, 3);
    assert.equal(result.nextSelectionEnd, 13);
  });

  it("prefixes a bullet list item", () => {
    const result = applyMarkdownFormat("Item one", 0, 8, "bulletList");
    assert.equal(result.nextValue, "- Item one");
    assert.equal(result.nextSelectionStart, 2);
    assert.equal(result.nextSelectionEnd, 10);
  });

  it("inserts a horizontal rule at the cursor", () => {
    const result = applyMarkdownFormat("Intro\n\nNext", 6, 6, "horizontalRule");
    assert.equal(result.nextValue, "Intro\n\n---\n\nNext");
    assert.equal(result.nextSelectionStart, 12);
    assert.equal(result.nextSelectionEnd, 12);
  });
});

describe("addMarkdownSubsectionBreaks", () => {
  it("adds a horizontal rule before level-2 subsection headings", () => {
    const input = "Intro paragraph.\n\n## Vision & Mission\n\nBody text.";
    const result = addMarkdownSubsectionBreaks(input);
    assert.equal(
      result,
      "Intro paragraph.\n\n---\n\n## Vision & Mission\n\nBody text.",
    );
  });

  it("adds extra blank line before level-3 headings without a divider", () => {
    const input = "Fees\n\n### Tuition\n\nAmount";
    const result = addMarkdownSubsectionBreaks(input);
    assert.equal(result, "Fees\n\n\n### Tuition\n\nAmount");
  });

  it("adds blank lines between numbered definition items", () => {
    const input = "1. **Agreement** — text.\n2. **RMS** — text.";
    const result = addMarkdownSubsectionBreaks(input);
    assert.equal(result, "1. **Agreement** — text.\n\n2. **RMS** — text.");
  });

  it("adds blank lines before bold standalone labels", () => {
    const input = "Fees\n\n**Supply Fee**\n\n- Item";
    const result = addMarkdownSubsectionBreaks(input);
    assert.equal(result, "Fees\n\n\n**Supply Fee**\n\n- Item");
  });

  it("is idempotent when spacing is already applied", () => {
    const input = "Intro paragraph.\n\n---\n\n## Vision & Mission\n\nBody text.";
    const result = addMarkdownSubsectionBreaks(addMarkdownSubsectionBreaks(input));
    assert.equal(result, input);
  });
});
