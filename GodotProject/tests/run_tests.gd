extends SceneTree

const Ecology = preload("res://scripts/systems/ecology.gd")
const Knowledge = preload("res://scripts/systems/knowledge.gd")
const Terror = preload("res://scripts/systems/terror.gd")

var passed: int = 0
var failed: int = 0

func _initialize() -> void:
	call_deferred("_run")

func _check(condition: bool, label: String) -> void:
	if condition:
		passed += 1
		print("PASS: " + label)
	else:
		failed += 1
		push_error("FAIL: " + label)

func _run() -> void:
	var ecology: Dictionary = Ecology.create_state()
	_check(Ecology.expose_to_amoebic(ecology, 0.1), "amoebic exposure starts incubation")
	Ecology.advance(ecology, 11.5)
	_check(ecology["amoebic"]["phase"] == "incubating", "amoebic incubation remains active before twelve hours")
	Ecology.advance(ecology, 0.5)
	_check(ecology["amoebic"]["phase"] == "active", "amoebic incubation completes at twelve hours")
	_check(is_equal_approx(Ecology.absorb_carbohydrates(ecology, 20.0), 12.0), "active amoebic state reduces carbohydrate absorption")

	var botfly: Dictionary = Ecology.create_state()
	_check(not Ecology.expose_to_botfly_scent(botfly, 9.0), "botfly exposure below threshold does not trigger")
	_check(Ecology.expose_to_botfly_scent(botfly, 1.0), "botfly exposure triggers at ten minutes")
	Ecology.advance(botfly, 48.0)
	_check(botfly["botfly"]["phase"] == "active", "botfly development completes after forty-eight hours")
	_check(Ecology.apply_resin_to_botfly(botfly), "resin begins treatment wait")
	Ecology.advance(botfly, 2.0)
	_check(botfly["botfly"]["phase"] == "extraction_ready", "treatment wait completes after two hours")
	_check(Ecology.complete_botfly_extraction(botfly), "botfly state returns to clear")

	var pollution: Dictionary = Ecology.create_state()
	Ecology.emit_industrial_smoke(pollution, 55.0)
	Ecology.advance(pollution, 47.0)
	_check(pollution["sef_ilun_stance"] == "observant", "pollution threshold requires sustained exposure")
	Ecology.emit_industrial_smoke(pollution, 5.0)
	Ecology.advance(pollution, 1.0)
	_check(pollution["sef_ilun_stance"] == "hostile", "sustained pollution changes Sef-Ilun stance")

	var source := {"x": 0.0, "z": 0.0, "intensity": 1.0}
	_check(Ecology.calculate_downwind_scent(source, {"x": 10.0, "z": 0.0}, Vector2.RIGHT) > 0.0, "downwind scent exists inside wind corridor")
	_check(Ecology.calculate_downwind_scent(source, {"x": -10.0, "z": 0.0}, Vector2.RIGHT) == 0.0, "upwind scent is absent")

	var jaguar := {"ai_state": "roaming", "warning_timer": 0.0}
	_check(Ecology.advance_jaguar_state(jaguar, {"distance": 18.0, "fire_distance": 30.0}, 0.1) == "stalking", "jaguar stalks at intermediate distance")
	_check(Ecology.advance_jaguar_state(jaguar, {"distance": 5.0, "fire_distance": 30.0}, 0.1) == "warning", "jaguar warns at close distance")
	_check(Ecology.advance_jaguar_state(jaguar, {"distance": 5.0, "fire_distance": 30.0, "player_sprinting": true}, 2.5) == "pouncing", "jaguar warning transition is retained")
	_check(Ecology.advance_jaguar_state(jaguar, {"distance": 5.0, "fire_distance": 4.0}, 0.1) == "retreating", "nearby fire causes retreat")
	_check(Ecology.should_spawn_jaguar(true, 0, 0.02), "nighttime rare spawn check succeeds on matching roll")
	_check(not Ecology.should_spawn_jaguar(false, 0, 0.0), "jaguar does not spawn during daytime")

	var notebook: Dictionary = Knowledge.create_notebook_state()
	_check(Knowledge.discover_recipe_by_combination(notebook, {"liana_vine": 1, "split_stone_blade": 1, "long_hardwood_stick": 1}, 3), "exact recipe combination is discovered")
	_check(not Knowledge.discover_recipe_by_combination(notebook, {"grey_swamp_clay": 1, "river_silt": 2, "dried_river_grass_bundle": 1, "stone": 1}, 1), "extra recipe ingredient is rejected")
	_check(Knowledge.record_notebook_discovery(notebook, "specimen", "intact_dried_gourd", 1), "specimen discovery records its recipe")
	_check(not Knowledge.record_notebook_discovery(notebook, "specimen", "intact_dried_gourd", 2), "duplicate specimen discovery is ignored")
	_check(Knowledge.get_notebook_entries(notebook).size() == 2, "notebook contains only discovered recipes")

	var terror: Dictionary = Terror.create_state()
	Terror.advance(terror, 10.0, 19.0)
	_check(terror["phase"] == 2, "terror phase two begins after eight seconds")
	Terror.advance(terror, 10.0, 1.0)
	_check(terror["phase"] == 3 and terror["watch_corrupted"], "terror phase three begins after twenty seconds")
	_check(Terror.trigger_taboo_consumption(terror), "taboo state activates once")
	_check(not Terror.trigger_taboo_consumption(terror), "taboo state cannot activate twice")
	_check(Terror.should_show_peripheral_actor(0.0, PI / 3.0), "peripheral actor remains outside central view")
	_check(not Terror.should_show_peripheral_actor(0.0, 0.0), "peripheral actor is hidden in central view")

	print("WILDLANDS Godot tests: %d passed, %d failed" % [passed, failed])
	quit(1 if failed > 0 else 0)
