import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MOCK_COOP_SUPPLY_ITEMS } from "./program-coop-supply-list-mock";
import {
  countActiveCoopSupplyFilters,
  DEFAULT_COOP_SUPPLY_LIST_FILTERS,
  filterCoopSupplyListItems,
} from "./program-coop-supply-list-filters";

describe("program coop supply list filters", () => {
  const parentContext = {
    variant: "parent" as const,
    currentParentName: "Sarah Mitchell",
  };

  it("filters by search text across name and store", () => {
    const filtered = filterCoopSupplyListItems(
      MOCK_COOP_SUPPLY_ITEMS,
      { ...DEFAULT_COOP_SUPPLY_LIST_FILTERS, search: "target" },
      parentContext,
    );

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.id, "supply-glue-sticks");
  });

  it("filters by month for specific-month items", () => {
    const filtered = filterCoopSupplyListItems(
      MOCK_COOP_SUPPLY_ITEMS,
      { ...DEFAULT_COOP_SUPPLY_LIST_FILTERS, month: "Jan" },
      parentContext,
    );

    assert.equal(
      filtered.every((item) => item.months.includes("Jan")),
      true,
    );
    assert.equal(filtered.some((item) => item.id === "supply-paper-towels"), true);
  });

  it("filters by color highlight including uncolored rows", () => {
    const uncolored = filterCoopSupplyListItems(
      MOCK_COOP_SUPPLY_ITEMS,
      { ...DEFAULT_COOP_SUPPLY_LIST_FILTERS, colorId: "none" },
      parentContext,
    );
    assert.equal(uncolored.length, 1);
    assert.equal(uncolored[0]?.id, "supply-dry-erase");

    const sage = filterCoopSupplyListItems(
      MOCK_COOP_SUPPLY_ITEMS,
      { ...DEFAULT_COOP_SUPPLY_LIST_FILTERS, colorId: "sage" },
      parentContext,
    );
    assert.equal(sage.length, 1);
    assert.equal(sage[0]?.id, "supply-glue-sticks");
  });

  it("filters parent assignment status for mine and available", () => {
    const mine = filterCoopSupplyListItems(
      MOCK_COOP_SUPPLY_ITEMS,
      { ...DEFAULT_COOP_SUPPLY_LIST_FILTERS, assignment: "mine" },
      parentContext,
    );
    assert.deepEqual(mine.map((item) => item.id), ["supply-glue-sticks"]);

    const available = filterCoopSupplyListItems(
      MOCK_COOP_SUPPLY_ITEMS,
      { ...DEFAULT_COOP_SUPPLY_LIST_FILTERS, assignment: "available" },
      parentContext,
    );
    assert.equal(
      available.some((item) => item.id === "supply-glue-sticks"),
      false,
    );
    assert.equal(available.some((item) => item.id === "supply-dry-erase"), true);
  });

  it("filters admin assignment status for unassigned items", () => {
    const unassigned = filterCoopSupplyListItems(
      MOCK_COOP_SUPPLY_ITEMS,
      { ...DEFAULT_COOP_SUPPLY_LIST_FILTERS, assignment: "unassigned" },
      { variant: "admin" },
    );
    assert.equal(unassigned.length, 1);
    assert.equal(unassigned[0]?.id, "supply-dry-erase");
  });

  it("counts active filters", () => {
    assert.equal(countActiveCoopSupplyFilters(DEFAULT_COOP_SUPPLY_LIST_FILTERS), 0);
    assert.equal(
      countActiveCoopSupplyFilters({
        ...DEFAULT_COOP_SUPPLY_LIST_FILTERS,
        search: "glue",
        itemType: "consumable",
      }),
      2,
    );
  });
});
