import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  coopSupplyColorFilterOptions,
  DEFAULT_COOP_SUPPLY_LIST_FILTERS,
  filterCoopSupplyListItems,
} from "./program-coop-supply-list-filters";
import {
  formatSupplyEstimatedPrice,
  formatSupplyQuantity,
  type CoopSupplyListItem,
} from "./program-coop-supply-list-mock";

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

describe("supply list display formatters", () => {
  it("keeps the dollar sign on both ends of a price range", () => {
    assert.equal(
      formatSupplyEstimatedPrice({ mode: "range", minCents: 1500, maxCents: 2500 }),
      "$15.00–$25.00",
    );
  });

  it("formats quantities without doubled numbers or wrong plurals", () => {
    assert.equal(formatSupplyQuantity(baseItem({ quantity: 1, quantityLabel: "sets" })), "1 set");
    assert.equal(formatSupplyQuantity(baseItem({ quantity: 3, quantityLabel: "sets" })), "3 sets");
    assert.equal(formatSupplyQuantity(baseItem({ quantity: 1, quantityLabel: "2 rolls" })), "2 rolls");
    assert.equal(formatSupplyQuantity(baseItem({ quantity: 1, quantityLabel: "glasses" })), "1 glasses");
    assert.equal(formatSupplyQuantity(baseItem({ quantity: 4, quantityLabel: "" })), "4");
  });

  it("labels unnamed colours in the colour filter", () => {
    const options = coopSupplyColorFilterOptions([{ id: "c1", hex: "#ff0000", label: "  " }]);
    assert.equal(options.at(-1)?.label, "Unlabeled");
  });
});
