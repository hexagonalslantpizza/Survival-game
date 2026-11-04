class_name KnowledgeSystem
extends RefCounted

const RECIPE_CATALOG: Array[Dictionary] = [
	{"id":"split_stone_blade","name":"The Split Stone Blade","ingredients":{"river_stone":2},"output":{"split_stone_blade":1},"discovery":{"type":"world_action","id":"strike_two_river_stones"}},
	{"id":"primitive_stone_spear","name":"The Primitive Stone Spear","ingredients":{"long_hardwood_stick":1,"split_stone_blade":1,"liana_vine":1},"output":{"primitive_stone_spear":1},"discovery":{"type":"combination","ingredients":{"long_hardwood_stick":1,"split_stone_blade":1,"liana_vine":1}}},
	{"id":"heavy_bone_spear","name":"The Heavy Bone Spear","ingredients":{"long_hardwood_stick":1,"large_peccary_bone_shard":2,"liana_vine":1},"output":{"heavy_bone_spear":1},"discovery":{"type":"specimen","id":"large_peccary_bone_shard"}},
	{"id":"fire_hardened_bamboo_spear","name":"The Fire-Hardened Bamboo Spear","ingredients":{"long_green_bamboo_pole":1},"output":{"fire_hardened_bamboo_spear":1},"discovery":{"type":"world_action","id":"bamboo_blackened_near_fire"}},
	{"id":"primitive_recurve_bow","name":"The Primitive Recurve Bow","ingredients":{"flexible_ironwood_bough":1,"braided_reed_fiber":2},"output":{"primitive_recurve_bow":1},"discovery":{"type":"field_knowledge","id":"bahari_vatu_reed_weaving"}},
	{"id":"fledgling_arrow","name":"The Fledgling Arrow","ingredients":{"short_straight_stick":3,"small_split_stone":3,"macaw_feather":6},"output":{"fledgling_arrow":3},"discovery":{"type":"combination","ingredients":{"short_straight_stick":3,"small_split_stone":3,"macaw_feather":6}}},
	{"id":"split_coconut_bowls","name":"The Split Coconut Bowls","ingredients":{"green_tree_coconut":1,"split_stone_blade":1},"output":{"hollow_coconut_bowl":2},"discovery":{"type":"world_action","id":"strike_coconut_with_blade"}},
	{"id":"canteen_flask","name":"The Canteen Flask","ingredients":{"intact_dried_gourd":1,"liana_vine":2},"output":{"canteen_flask":1},"discovery":{"type":"specimen","id":"intact_dried_gourd"}},
	{"id":"crude_mud_shovel","name":"The Crude Mud Shovel","ingredients":{"medium_hardwood_stick":1,"large_tapir_shoulder_blade":1,"liana_vine":1},"output":{"crude_mud_shovel":1},"discovery":{"type":"world_action","id":"attempt_hand_gather_clay"}},
	{"id":"primitive_fire_drill_board","name":"The Primitive Fire-Drill Board","ingredients":{"dry_split_log":1,"short_hardwood_stick":1},"output":{"primitive_fire_drill_board":1},"discovery":{"type":"specimen","id":"dry_split_log"}},
	{"id":"unfired_clay_brick","name":"The Unfired Clay Brick","ingredients":{"grey_swamp_clay":1,"river_silt":2,"dried_river_grass_bundle":1},"output":{"unfired_clay_brick":1},"discovery":{"type":"combination","ingredients":{"grey_swamp_clay":1,"river_silt":2,"dried_river_grass_bundle":1}}},
	{"id":"mud_charcoal_kiln","name":"The Mud Charcoal Kiln","ingredients":{"fired_clay_brick":12,"raw_clay":6},"output":{"mud_charcoal_kiln":1},"discovery":{"type":"milestone","id":"dried_twelfth_brick"}},
	{"id":"high_tier_draft_furnace","name":"The High-Tier Draft Furnace","ingredients":{"fired_clay_brick":24,"large_river_boulder":8,"crushed_limestone_paste":1},"output":{"high_tier_draft_furnace":1},"discovery":{"type":"specimen","id":"deep_iron_ore"}},
	{"id":"forged_iron_axe","name":"The Forged Iron Axe","ingredients":{"hardened_clay_axe_cast_mold":1,"molten_iron":1,"thick_hardwood_handle":1,"dried_liana_vine":1},"output":{"forged_iron_axe":1},"discovery":{"type":"world_action","id":"pour_iron_into_axe_mold"}}
]

static func create_notebook_state() -> Dictionary:
	return {"discovered_recipe_ids": {}, "entries": [], "discovered_specimens": {}, "discovered_knowledge": {}}

static func get_recipe_catalog() -> Array[Dictionary]:
	return RECIPE_CATALOG.duplicate(true)

static func _same_ingredient_set(actual: Dictionary, required: Dictionary) -> bool:
	var actual_keys: Array = []
	var required_keys: Array = []
	for key in actual.keys():
		if actual[key] > 0:
			actual_keys.append(key)
	for key in required.keys():
		if required[key] > 0:
			required_keys.append(key)
	if actual_keys.size() != required_keys.size():
		return false
	for key in required_keys:
		if actual.get(key, 0) != required[key]:
			return false
	return true

static func discover_recipe(notebook: Dictionary, recipe_id: String, day: int = 1) -> bool:
	if notebook["discovered_recipe_ids"].has(recipe_id):
		return false
	for recipe in RECIPE_CATALOG:
		if recipe["id"] == recipe_id:
			notebook["discovered_recipe_ids"][recipe_id] = true
			notebook["entries"].append({
				"type": "recipe",
				"id": recipe["id"],
				"title": recipe["name"],
				"ingredients": recipe["ingredients"].duplicate(true),
				"output": recipe["output"].duplicate(true),
				"day": day
			})
			return true
	return false

static func discover_recipe_by_combination(notebook: Dictionary, items_on_mat: Dictionary, day: int = 1) -> bool:
	for recipe in RECIPE_CATALOG:
		if recipe["discovery"]["type"] == "combination" and _same_ingredient_set(items_on_mat, recipe["discovery"]["ingredients"]):
			return discover_recipe(notebook, recipe["id"], day)
	return false

static func record_notebook_discovery(notebook: Dictionary, discovery_type: String, discovery_id: String, day: int = 1) -> bool:
	if not ["world_action", "specimen", "field_knowledge", "milestone"].has(discovery_type) or discovery_id.is_empty():
		return false
	if discovery_type == "specimen":
		if notebook["discovered_specimens"].has(discovery_id):
			return false
		notebook["discovered_specimens"][discovery_id] = true
	if discovery_type == "field_knowledge":
		if notebook["discovered_knowledge"].has(discovery_id):
			return false
		notebook["discovered_knowledge"][discovery_id] = true
	for recipe in RECIPE_CATALOG:
		if recipe["discovery"]["type"] == discovery_type and recipe["discovery"].get("id", "") == discovery_id:
			return discover_recipe(notebook, recipe["id"], day)
	return false

static func get_notebook_entries(notebook: Dictionary) -> Array[Dictionary]:
	return notebook["entries"].duplicate(true)
