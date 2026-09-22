import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildFridayBranchClassSavePayload,
  mergeFridayBranchClassIntoBlock,
} from "./friday-branch-class-save";
import type { FridayBranchBlock, FridayBranchClass } from "./friday-branch-types";

const baseClass: FridayBranchClass = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Art",
  location: "Studio",
  ageGroup: "K-2",
  teacher: "Ms. Test",
  familyVisible: true,
  capacity: 10,
};

const baseBlock: FridayBranchBlock = {
  id: "00000000-0000-4000-8000-000000000010",
  label: "Block 1",
  startDate: "2026-09-01",
  endDate: "2026-09-30",
  accent: "sky",
  status: "current",
  slots: [
    {
      id: "00000000-0000-4000-8000-000000000020",
      time: "9:00",
      classes: [baseClass],
    },
  ],
};

describe("friday-branch-class-save", () => {
  it("builds class payload with price and flyer fields", () => {
    const payload = buildFridayBranchClassSavePayload(
      {
        ...baseClass,
        flyerStoragePath: "org/classes/id/flyer.pdf",
        flyerFileName: "Flyer.pdf",
        flyerFileSizeBytes: 1024,
      },
      "12.50",
    );

    assert.ok(!("error" in payload));
    assert.equal(payload.priceCents, 1250);
    assert.equal(payload.flyerStoragePath, "org/classes/id/flyer.pdf");
    assert.equal(payload.flyerFileName, "Flyer.pdf");
    assert.equal(payload.flyerFileSizeBytes, 1024);
  });

  it("parses prices with leading whitespace", () => {
    const payload = buildFridayBranchClassSavePayload(baseClass, " 55");
    assert.ok(!("error" in payload));
    assert.equal(payload.priceCents, 5500);
  });

  it("merges updated class fields into the block", () => {
    const updatedClass: FridayBranchClass = {
      ...baseClass,
      priceCents: 5500,
      flyerStoragePath: "org/classes/id/flyer.pdf",
      flyerFileName: "Ticket.pdf",
      flyerFileSizeBytes: 2048,
    };

    const nextBlock = mergeFridayBranchClassIntoBlock(
      baseBlock,
      baseBlock.slots[0].id,
      updatedClass,
    );

    const savedClass = nextBlock.slots[0].classes[0];
    assert.equal(savedClass.priceCents, 5500);
    assert.equal(savedClass.flyerFileName, "Ticket.pdf");
  });
});
