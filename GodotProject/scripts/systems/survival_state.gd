class_name SurvivalState
extends RefCounted

const Ecology = preload("res://scripts/systems/ecology.gd")
const Terror = preload("res://scripts/systems/terror.gd")
const Knowledge = preload("res://scripts/systems/knowledge.gd")

var health: float = 100.0
var hunger: float = 100.0
var thirst: float = 100.0
var stamina: float = 100.0
var sanity: float = 100.0
var infection: float = 0.0
var parasites: float = 0.0
var day: int = 1
var time: float = 8.5
var difficulty: String = "normal"
var survival_enabled: bool = true
var god_mode: bool = false
var temperature: float = 28.0
var wetness: float = 0.0
var weather: String = "clear"
var wounds: Array[Dictionary] = []
var inventory: Dictionary = {}
var notebook: Dictionary = Knowledge.create_notebook_state()
var ecology: Dictionary = Ecology.create_state()
var terror: Dictionary = Terror.create_state()
var hunger_damage_timer: float = 0.0
var thirst_damage_timer: float = 0.0
var infection_timer: float = 0.0

func advance(delta: float) -> void:
	var dt: float = maxf(0.0, delta)
	time += dt * 0.025
	var game_hours_delta: float = dt * 0.025
	if survival_enabled:
		Ecology.advance(ecology, game_hours_delta)
	if time >= 24.0:
		time -= 24.0
		day += 1
	if weather == "rain":
		wetness = minf(100.0, wetness + dt * 2.5)
	else:
		wetness = maxf(0.0, wetness - dt * 0.5)
	temperature = 23.0 if weather == "rain" else 28.0
	if not survival_enabled:
		return

	var difficulty_multiplier: float = 0.65 if difficulty == "easy" else (1.55 if difficulty == "hard" else 1.0)
	hunger = maxf(0.0, hunger - dt * 0.075 * difficulty_multiplier)
	thirst = maxf(0.0, thirst - dt * 0.12 * difficulty_multiplier)

	if hunger <= 0.0:
		hunger_damage_timer += dt
		if hunger_damage_timer > 5.0:
			hunger_damage_timer = 0.0
			if not god_mode:
				health = maxf(0.0, health - 1.0)
	else:
		hunger_damage_timer = 0.0

	if thirst <= 0.0:
		thirst_damage_timer += dt
		if thirst_damage_timer > 3.0:
			thirst_damage_timer = 0.0
			if not god_mode:
				health = maxf(0.0, health - 1.5)
	else:
		thirst_damage_timer = 0.0

	stamina = minf(100.0, stamina + dt * 4.5)
	if infection > 0.0:
		infection_timer += dt
		if infection_timer > 5.0:
			infection_timer = 0.0
			if not god_mode:
				health = maxf(0.0, health - infection * 0.002)
	if parasites > 0.0:
		hunger = maxf(0.0, hunger - dt * 0.025 * (parasites / 20.0))
	for wound in wounds:
		wound["age"] += dt
		if wound["age"] > 90.0:
			infection = minf(100.0, infection + dt * 0.025)
	sanity = maxf(0.0, sanity - (dt * 0.035 if time > 20.0 or time < 5.0 else 0.0))
	Terror.advance(terror, sanity, dt)

func can_sprint() -> bool:
	return not survival_enabled or stamina > 1.0

func sprint_multiplier() -> float:
	return 1.0 if not survival_enabled else (1.0 if stamina > 0.0 else 0.625)

func consume_sprint(delta: float, sprinting: bool) -> void:
	if survival_enabled and sprinting:
		stamina = maxf(0.0, stamina - maxf(0.0, delta) * 16.0)

func apply_fall_damage(impact_speed: float) -> float:
	var damage: float = minf(45.0, maxf(0.0, (impact_speed - 12.0) * 3.2))
	if damage > 0.0 and not god_mode:
		health = maxf(0.0, health - damage)
	return damage
