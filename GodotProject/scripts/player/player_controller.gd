class_name PlayerController
extends CharacterBody3D

const SurvivalState = preload("res://scripts/systems/survival_state.gd")

@onready var camera: Camera3D = $Camera3D

var survival = SurvivalState.new()
var walk_speed: float = 5.0
var sprint_speed: float = 8.0
var acceleration: float = 14.0
var gravity_strength: float = 20.0
var jump_velocity: float = 7.5
var mouse_sensitivity: float = 0.0022

func _ready() -> void:
	_setup_input()
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE

func _setup_input() -> void:
	_add_key_action("move_forward", KEY_W)
	_add_key_action("move_back", KEY_S)
	_add_key_action("move_left", KEY_A)
	_add_key_action("move_right", KEY_D)
	_add_key_action("jump", KEY_SPACE)
	_add_key_action("sprint", KEY_SHIFT)

func _add_key_action(action_name: String, keycode: Key) -> void:
	if not InputMap.has_action(action_name):
		InputMap.add_action(action_name)
	var event := InputEventKey.new()
	event.physical_keycode = keycode
	if not InputMap.action_get_events(action_name).any(func(existing: InputEvent) -> bool: return existing is InputEventKey and existing.physical_keycode == keycode):
		InputMap.action_add_event(action_name, event)

func _input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		if Input.mouse_mode != Input.MOUSE_MODE_CAPTURED:
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	elif event is InputEventKey and event.keycode == KEY_ESCAPE and event.pressed:
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	elif event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		rotate_y(-event.relative.x * mouse_sensitivity)
		camera.rotate_x(-event.relative.y * mouse_sensitivity)
		camera.rotation.x = clampf(camera.rotation.x, -1.45, 1.45)

func _physics_process(delta: float) -> void:
	survival.advance(delta)

	var input_vector: Vector2 = Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var direction: Vector3 = (global_transform.basis * Vector3(input_vector.x, 0.0, input_vector.y)).normalized()
	var moving: bool = direction.length_squared() > 0.0001
	var sprinting: bool = Input.is_action_pressed("sprint") and moving and survival.can_sprint()
	var target_speed: float = sprint_speed * survival.sprint_multiplier() if sprinting else walk_speed

	velocity.x = move_toward(velocity.x, direction.x * target_speed, acceleration * delta)
	velocity.z = move_toward(velocity.z, direction.z * target_speed, acceleration * delta)
	survival.consume_sprint(delta, sprinting)

	if not is_on_floor():
		velocity.y -= gravity_strength * delta
	elif Input.is_action_just_pressed("jump"):
		velocity.y = jump_velocity
	else:
		velocity.y = -0.1

	var impact_velocity: float = velocity.y
	move_and_slide()
	if is_on_floor() and impact_velocity < -13.0:
		survival.apply_fall_damage(-impact_velocity)
