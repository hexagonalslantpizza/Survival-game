extends Node3D

@onready var player: PlayerController = $Player
@onready var sun: DirectionalLight3D = $Sun
@onready var world_environment: WorldEnvironment = $WorldEnvironment

func _process(_delta: float) -> void:
	var hour: float = player.survival.time
	var daylight: float = maxf(0.0, sin(((hour - 6.0) / 12.0) * PI))
	sun.light_energy = 0.12 + daylight * 2.0
	sun.position = Vector3(-65.0 + cos(hour * PI / 12.0) * 35.0, 20.0 + daylight * 90.0, 35.0)
	sun.look_at(Vector3.ZERO, Vector3.UP)
	world_environment.environment.ambient_light_energy = 0.35 + daylight * 1.2
