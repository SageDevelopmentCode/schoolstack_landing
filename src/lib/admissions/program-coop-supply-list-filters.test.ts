import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_COOP_SUPPLY_LIST_FILTERS,
  filterCoopSupplyListItems,
} from "./program-coop-supply-list-filters";
import type { CoopSupplyListItem } from "./program-coop-supply-list-mock";

const baseItem = (overrides: Partial<CoopSupplyListItem> = {}): CoopSupplyListItem => ({
  id: "item-1",
  name: "Glue sticks",
  itemType: "consumable",
  usageTiming: "year_round",
  months: [],
  colorId: null,
  assignedFamilyIds: [],
  whereToBuy: "",
  quantity: 1,
  quantityLabel: "",
  estimatedPrice: { mode: "unset" },
  ...overrides,
});

describe("filterCoopSupplyListItems parent context", () => {
  const parentContext = {
    variant: "parent" as const,
    currentFamilyId: "family-sarah",
  };

  it("filters mine sign-ups by family id", () => {
    const items = [
      baseItem({ id: "mine", assignedFamilyIds: ["family-sarah"] }),
      baseItem({ id: "other", assignedFamilyIds: ["family-other"] }),
    ];

    const filtered = filterCoopSupplyListItems(
      items,
      { ...DEFAULT_COOP_SUPPLY_LIST_FILTERS, assignment: "mine" },
      parentContext,
    );

    assert.deepEqual(filtered.map((item) => item.id), ["mine"]);
  });

  it("does not treat same display-name different families as mine", () => {
    const items = [
      baseItem({ id: "other-john", assignedFamilyIds: ["family-john-a"] }),
    ];

    const filtered = filterCoopSupplyListItems(
      items,
      { ...DEFAULT_COOP_SUPPLY_LIST_FILTERS, assignment: "mine" },
      { variant: "parent", currentFamilyId: "family-john-b" },
    );

    assert.equal(filtered.length, 0);
  });
});
