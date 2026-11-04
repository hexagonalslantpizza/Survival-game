class_name EcologySystem
extends RefCounted

static func create_state() -> Dictionary:
	return {
		"amoebic": {"phase": "clear", "incubation_hours_remaining": 0.0},
		"botfly": {"phase": "clear", "exposure_minutes": 0.0, "development_hours_remaining": 0.0, "resin_applied": false},
		"air_pollution_load": 0.0,
		"hours_above_pollution_threshold": 0.0,
		"sef_ilun_stance": "observant"
	}

static func expose_to_amoebic(ecology: Dictionary, roll: float = -1.0) -> bool:
	if ecology["amoebic"]["phase"] != "clear":
		return false
	var chance_roll: float = randf() if roll < 0.0 else roll
	if chance_roll >= 0.35:
		return false
	ecology["amoebic"]["phase"] = "incubating"
	ecology["amoebic"]["incubation_hours_remaining"] = 12.0
	return true

static func absorb_carbohydrates(ecology: Dictionary, amount: float) -> float:
	var safe_amount: float = maxf(0.0, amount)
	return safe_amount * 0.6 if ecology["amoebic"]["phase"] == "active" else safe_amount

static func expose_to_botfly_scent(ecology: Dictionary, minutes: float, sheltered_by_smoke: bool = false) -> bool:
	if ecology["botfly"]["phase"] != "clear":
		return false
	if sheltered_by_smoke or minutes <= 0.0:
		ecology["botfly"]["exposure_minutes"] = 0.0
		return false
	ecology["botfly"]["exposure_minutes"] += maxf(0.0, minutes)
	if ecology["botfly"]["exposure_minutes"] < 10.0:
		return false
	ecology["botfly"]["phase"] = "developing"
	ecology["botfly"]["development_hours_remaining"] = 48.0
	return true

static func apply_resin_to_botfly(ecology: Dictionary) -> bool:
	if ecology["botfly"]["phase"] != "active" or ecology["botfly"]["resin_applied"]:
		return false
	ecology["botfly"]["resin_applied"] = true
	ecology["botfly"]["phase"] = "treatment_wait"
	ecology["botfly"]["development_hours_remaining"] = 2.0
	return true

static func complete_botfly_extraction(ecology: Dictionary) -> bool:
	if ecology["botfly"]["phase"] != "extraction_ready":
		return false
	ecology["botfly"]["phase"] = "clear"
	ecology["botfly"]["exposure_minutes"] = 0.0
	ecology["botfly"]["development_hours_remaining"] = 0.0
	ecology["botfly"]["resin_applied"] = false
	return true

static func emit_industrial_smoke(ecology: Dictionary, amount: float) -> float:
	ecology["air_pollution_load"] = minf(100.0, ecology["air_pollution_load"] + maxf(0.0, amount))
	return ecology["air_pollution_load"]

static func advance(ecology: Dictionary, game_hours: float) -> void:
	var hours: float = maxf(0.0, game_hours)
	var amoebic: Dictionary = ecology["amoebic"]
	if amoebic["phase"] == "incubating":
		amoebic["incubation_hours_remaining"] = maxf(0.0, amoebic["incubation_hours_remaining"] - hours)
		if amoebic["incubation_hours_remaining"] == 0.0:
			amoebic["phase"] = "active"

	var botfly: Dictionary = ecology["botfly"]
	if botfly["phase"] in ["developing", "treatment_wait"]:
		botfly["development_hours_remaining"] = maxf(0.0, botfly["development_hours_remaining"] - hours)
		if botfly["development_hours_remaining"] == 0.0:
			botfly["phase"] = "active" if botfly["phase"] == "developing" else "extraction_ready"

	ecology["air_pollution_load"] = maxf(0.0, ecology["air_pollution_load"] - hours * 0.08)
	if ecology["air_pollution_load"] >= 50.0:
		ecology["hours_above_pollution_threshold"] += hours
		if ecology["hours_above_pollution_threshold"] >= 48.0:
			ecology["sef_ilun_stance"] = "hostile"
	else:
		ecology["hours_above_pollution_threshold"] = 0.0
		if ecology["air_pollution_load"] < 30.0:
			ecology["sef_ilun_stance"] = "observant"

static func calculate_downwind_scent(source: Dictionary, observer: Dictionary, wind: Vector2, max_distance: float = 1000.0) -> float:
	var wind_length: float = wind.length()
	if wind_length < 0.0001 or max_distance <= 0.0:
		return 0.0
	var direction: Vector2 = wind / wind_length
	var offset := Vector2(observer.get("x", 0.0) - source.get("x", 0.0), observer.get("z", 0.0) - source.get("z", 0.0))
	var downwind_distance: float = offset.dot(direction)
	if downwind_distance <= 0.0 or downwind_distance >= max_distance:
		return 0.0
	var crosswind_distance: float = absf(offset.x * direction.y - offset.y * direction.x)
	var corridor_width: float = maxf(2.0, downwind_distance * 0.35)
	if crosswind_distance >= corridor_width:
		return 0.0
	var distance_factor: float = 1.0 - downwind_distance / max_distance
	var lateral_factor: float = 1.0 - crosswind_distance / corridor_width
	return clampf(distance_factor * lateral_factor * source.get("intensity", 1.0), 0.0, 1.0)

static func advance_jaguar_state(animal: Dictionary, context: Dictionary, delta: float) -> String:
	var distance: float = maxf(0.0, context.get("distance", 0.0))
	var fire_distance: float = context.get("fire_distance", INF)
	var sprinting: bool = context.get("player_sprinting", false)
	var scent_strength: float = maxf(0.0, context.get("scent_strength", 0.0))
	animal["ai_state"] = animal.get("ai_state", "roaming")
	animal["warning_timer"] = animal.get("warning_timer", 0.0)
	animal["warning_cooldown"] = maxf(0.0, animal.get("warning_cooldown", 0.0) - maxf(0.0, delta))

	if fire_distance < 7.0:
		animal["ai_state"] = "retreating"
		animal["warning_timer"] = 0.0
		return animal["ai_state"]
	if animal["ai_state"] == "retreating":
		if distance > 28.0 and fire_distance > 10.0:
			animal["ai_state"] = "roaming"
		return animal["ai_state"]
	if distance > 22.0:
		animal["ai_state"] = "investigating" if scent_strength > 0.08 else "roaming"
		animal["warning_timer"] = 0.0
		return animal["ai_state"]
	if animal["ai_state"] == "investigating" and scent_strength <= 0.08:
		animal["ai_state"] = "roaming"
	if animal["ai_state"] == "pouncing":
		return animal["ai_state"]
	if animal["ai_state"] == "warning":
		animal["warning_timer"] = maxf(0.0, animal["warning_timer"] - maxf(0.0, delta))
		if distance > 10.0:
			animal["ai_state"] = "stalking"
			animal["warning_timer"] = 0.0
		elif animal["warning_timer"] == 0.0 and sprinting:
			animal["ai_state"] = "pouncing"
		elif animal["warning_timer"] == 0.0:
			animal["ai_state"] = "stalking"
			animal["warning_cooldown"] = 6.0
		return animal["ai_state"]
	if distance < 6.0 and animal["warning_cooldown"] <= 0.0:
		animal["ai_state"] = "warning"
		animal["warning_timer"] = 2.5
	else:
		animal["ai_state"] = "stalking"
	return animal["ai_state"]

static func should_spawn_jaguar(is_night: bool, existing_count: int, roll: float = -1.0) -> bool:
	var chance_roll: float = randf() if roll < 0.0 else roll
	return is_night and existing_count == 0 and chance_roll < 0.03
