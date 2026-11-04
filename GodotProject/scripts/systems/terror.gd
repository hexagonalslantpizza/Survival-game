class_name TerrorSystem
extends RefCounted

static func create_state() -> Dictionary:
	return {
		"phase": 0,
		"low_sanity_seconds": 0.0,
		"mimic_enabled": false,
		"shadow_actors_enabled": false,
		"watch_corrupted": false,
		"taboo_consumed": false,
		"voice_profile": "human",
		"faction_threat": "normal"
	}

static func advance(terror: Dictionary, sanity: float, delta: float) -> Dictionary:
	var dt: float = maxf(0.0, delta)
	if sanity < 15.0:
		terror["low_sanity_seconds"] += dt
	elif sanity > 20.0:
		terror["low_sanity_seconds"] = maxf(0.0, terror["low_sanity_seconds"] - dt * 2.0)
	var seconds: float = terror["low_sanity_seconds"]
	terror["phase"] = 3 if seconds >= 20.0 else (2 if seconds >= 8.0 else (1 if seconds > 0.0 else 0))
	terror["mimic_enabled"] = terror["phase"] == 3
	terror["shadow_actors_enabled"] = terror["phase"] == 3
	terror["watch_corrupted"] = terror["phase"] == 3
	return terror

static func trigger_taboo_consumption(terror: Dictionary) -> bool:
	if terror["taboo_consumed"]:
		return false
	terror["taboo_consumed"] = true
	terror["voice_profile"] = "feral"
	terror["faction_threat"] = "ecosystem_hunt"
	return true

static func should_show_peripheral_actor(camera_yaw: float, actor_yaw: float, central_view_degrees: float = 60.0) -> bool:
	var difference: float = fposmod(actor_yaw - camera_yaw + PI * 3.0, TAU) - PI
	return absf(difference) > (central_view_degrees * PI / 360.0) and absf(difference) < PI * 0.78
