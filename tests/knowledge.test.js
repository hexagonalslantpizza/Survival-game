import test from "node:test";
import assert from "node:assert/strict";
import { createNotebookState, discoverRecipeByCombination, recordNotebookDiscovery, getNotebookEntries, getRecipeCatalog } from "../src/systems/knowledge.js";

test("the notebook starts completely blank", () => {
  const notebook = createNotebookState();
  assert.equal(notebook.entries.length, 0);
  assert.equal(notebook.discoveredRecipeIds.size, 0);
});

test("combining the exact primitive spear ingredients discovers its recipe", () => {
  const notebook = createNotebookState();
  const items = { liana_vine:1, split_stone_blade:1, long_hardwood_stick:1 };
  assert.equal(discoverRecipeByCombination(notebook, items, 3), true);
  assert.equal(notebook.entries[0].id, "primitive_stone_spear");
  assert.equal(notebook.entries[0].day, 3);
});

test("combination discovery is order-independent but rejects missing or extra ingredients", () => {
  const notebook = createNotebookState();
  assert.equal(discoverRecipeByCombination(notebook, { grey_swamp_clay:1, dried_river_grass_bundle:1 }, 1), false);
  assert.equal(discoverRecipeByCombination(notebook, { grey_swamp_clay:1, river_silt:2, dried_river_grass_bundle:1, stone:1 }, 1), false);
  assert.equal(discoverRecipeByCombination(notebook, { river_silt:2, dried_river_grass_bundle:1, grey_swamp_clay:1 }, 1), true);
});

test("world actions and first specimen discoveries can sketch recipes", () => {
  const notebook = createNotebookState();
  assert.equal(recordNotebookDiscovery(notebook, "world_action", "strike_two_river_stones", 1), true);
  assert.equal(recordNotebookDiscovery(notebook, "specimen", "large_peccary_bone_shard", 2), true);
  assert.deepEqual(notebook.entries.map(entry => entry.id), ["split_stone_blade","heavy_bone_spear"]);
});

test("a recipe is recorded only once", () => {
  const notebook = createNotebookState();
  assert.equal(recordNotebookDiscovery(notebook, "specimen", "intact_dried_gourd", 1), true);
  assert.equal(recordNotebookDiscovery(notebook, "specimen", "intact_dried_gourd", 2), false);
  assert.equal(notebook.entries.length, 1);
});

test("unknown triggers do not create notebook entries", () => {
  const notebook = createNotebookState();
  assert.equal(recordNotebookDiscovery(notebook, "specimen", "unknown_plant", 1), false);
  assert.equal(recordNotebookDiscovery(notebook, "made_up", "anything", 1), false);
  assert.equal(notebook.entries.length, 0);
});

test("catalog returns copies so callers cannot mutate the canonical recipes", () => {
  const catalog = getRecipeCatalog();
  catalog[0].ingredients.river_stone = 999;
  assert.equal(getRecipeCatalog()[0].ingredients.river_stone, 2);
});
