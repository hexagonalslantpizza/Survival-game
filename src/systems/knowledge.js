const RECIPE_CATALOG = [
  { id:"split_stone_blade", name:"The Split Stone Blade", ingredients:{river_stone:2}, output:{split_stone_blade:1}, discovery:{type:"world_action", id:"strike_two_river_stones"} },
  { id:"primitive_stone_spear", name:"The Primitive Stone Spear", ingredients:{long_hardwood_stick:1,split_stone_blade:1,liana_vine:1}, output:{primitive_stone_spear:1}, discovery:{type:"combination", ingredients:{long_hardwood_stick:1,split_stone_blade:1,liana_vine:1}} },
  { id:"heavy_bone_spear", name:"The Heavy Bone Spear", ingredients:{long_hardwood_stick:1,large_peccary_bone_shard:2,liana_vine:1}, output:{heavy_bone_spear:1}, discovery:{type:"specimen", id:"large_peccary_bone_shard"} },
  { id:"fire_hardened_bamboo_spear", name:"The Fire-Hardened Bamboo Spear", ingredients:{long_green_bamboo_pole:1}, output:{fire_hardened_bamboo_spear:1}, discovery:{type:"world_action", id:"bamboo_blackened_near_fire"} },
  { id:"primitive_recurve_bow", name:"The Primitive Recurve Bow", ingredients:{flexible_ironwood_bough:1,braided_reed_fiber:2}, output:{primitive_recurve_bow:1}, discovery:{type:"field_knowledge", id:"bahari_vatu_reed_weaving"} },
  { id:"fledgling_arrow", name:"The Fledgling Arrow", ingredients:{short_straight_stick:3,small_split_stone:3,macaw_feather:6}, output:{fledgling_arrow:3}, discovery:{type:"combination", ingredients:{short_straight_stick:3,small_split_stone:3,macaw_feather:6}} },
  { id:"split_coconut_bowls", name:"The Split Coconut Bowls", ingredients:{green_tree_coconut:1,split_stone_blade:1}, output:{hollow_coconut_bowl:2}, discovery:{type:"world_action", id:"strike_coconut_with_blade"} },
  { id:"canteen_flask", name:"The Canteen Flask", ingredients:{intact_dried_gourd:1,liana_vine:2}, output:{canteen_flask:1}, discovery:{type:"specimen", id:"intact_dried_gourd"} },
  { id:"crude_mud_shovel", name:"The Crude Mud Shovel", ingredients:{medium_hardwood_stick:1,large_tapir_shoulder_blade:1,liana_vine:1}, output:{crude_mud_shovel:1}, discovery:{type:"world_action", id:"attempt_hand_gather_clay"} },
  { id:"primitive_fire_drill_board", name:"The Primitive Fire-Drill Board", ingredients:{dry_split_log:1,short_hardwood_stick:1}, output:{primitive_fire_drill_board:1}, discovery:{type:"specimen", id:"dry_split_log"} },
  { id:"unfired_clay_brick", name:"The Unfired Clay Brick", ingredients:{grey_swamp_clay:1,river_silt:2,dried_river_grass_bundle:1}, output:{unfired_clay_brick:1}, discovery:{type:"combination", ingredients:{grey_swamp_clay:1,river_silt:2,dried_river_grass_bundle:1}} },
  { id:"mud_charcoal_kiln", name:"The Mud Charcoal Kiln", ingredients:{fired_clay_brick:12,raw_clay:6}, output:{mud_charcoal_kiln:1}, discovery:{type:"milestone", id:"dried_twelfth_brick"} },
  { id:"high_tier_draft_furnace", name:"The High-Tier Draft Furnace", ingredients:{fired_clay_brick:24,large_river_boulder:8,crushed_limestone_paste:1}, output:{high_tier_draft_furnace:1}, discovery:{type:"specimen", id:"deep_iron_ore"} },
  { id:"forged_iron_axe", name:"The Forged Iron Axe", ingredients:{hardened_clay_axe_cast_mold:1,molten_iron:1,thick_hardwood_handle:1,dried_liana_vine:1}, output:{forged_iron_axe:1}, discovery:{type:"world_action", id:"pour_iron_into_axe_mold"} }
];

function sameIngredientSet(actual, required) {
  const actualKeys = Object.keys(actual).filter(key => (actual[key] || 0) > 0).sort();
  const requiredKeys = Object.keys(required).filter(key => required[key] > 0).sort();
  if (actualKeys.length !== requiredKeys.length) return false;
  return requiredKeys.every(key => actual[key] === required[key]);
}

export function createNotebookState() {
  return { discoveredRecipeIds: new Set(), entries: [], discoveredSpecimens: new Set(), discoveredKnowledge: new Set() };
}

export function getRecipeCatalog() {
  return RECIPE_CATALOG.map(recipe => ({
    ...recipe,
    ingredients: { ...recipe.ingredients },
    output: { ...recipe.output },
    discovery: { ...recipe.discovery, ...(recipe.discovery.ingredients ? { ingredients: { ...recipe.discovery.ingredients } } : {}) }
  }));
}

export function discoverRecipe(notebook, recipeId, day = 1) {
  const recipe = RECIPE_CATALOG.find(entry => entry.id === recipeId);
  if (!recipe || notebook.discoveredRecipeIds.has(recipeId)) return false;
  notebook.discoveredRecipeIds.add(recipeId);
  notebook.entries.push({ type:"recipe", id:recipe.id, title:recipe.name, ingredients:{...recipe.ingredients}, output:{...recipe.output}, day });
  return true;
}

export function discoverRecipeByCombination(notebook, itemsOnMat, day = 1) {
  const recipe = RECIPE_CATALOG.find(entry => entry.discovery.type === "combination" && sameIngredientSet(itemsOnMat, entry.discovery.ingredients));
  return recipe ? discoverRecipe(notebook, recipe.id, day) : false;
}

export function recordNotebookDiscovery(notebook, type, id, day = 1) {
  if (!["world_action","specimen","field_knowledge","milestone"].includes(type) || !id) return false;
  if (type === "specimen") {
    if (notebook.discoveredSpecimens.has(id)) return false;
    notebook.discoveredSpecimens.add(id);
  }
  if (type === "field_knowledge") {
    if (notebook.discoveredKnowledge.has(id)) return false;
    notebook.discoveredKnowledge.add(id);
  }
  const recipe = RECIPE_CATALOG.find(entry => entry.discovery.type === type && entry.discovery.id === id);
  if (!recipe) return false;
  return discoverRecipe(notebook, recipe.id, day);
}

export function getNotebookEntries(notebook) {
  return notebook.entries.map(entry => ({ ...entry, ingredients:{...entry.ingredients}, output:{...entry.output} }));
}
