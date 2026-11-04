extends Node3D

const WORLD_SIZE: float = 300.0
const HALF_WORLD: float = WORLD_SIZE * 0.5
const GRID: int = 180
const WORLD_SEED: int = 82471

var random := RandomNumberGenerator.new()
var trunk_material: StandardMaterial3D
var bark_material: StandardMaterial3D
var leaf_materials: Array[StandardMaterial3D] = []
var fern_materials: Array[StandardMaterial3D] = []
var rock_materials: Array[StandardMaterial3D] = []

func _ready() -> void:
	random.seed = WORLD_SEED
	_create_materials()
	_create_terrain()
	_create_forest()
	_create_boundaries()

static func _hash_noise(x: int, z: int) -> float:
	var n: int = (x * 374761393 + z * 668265263 + WORLD_SEED) & 0xffffffff
	n = (n ^ (n >> 13)) & 0xffffffff
	n = (n * 1274126177) & 0xffffffff
	n = (n ^ (n >> 16)) & 0xffffffff
	return float(n) / 4294967295.0

static func _smooth_noise(x: float, z: float) -> float:
	var ix: int = floori(x)
	var iz: int = floori(z)
	var fx: float = x - float(ix)
	var fz: float = z - float(iz)
	var sx: float = fx * fx * (3.0 - 2.0 * fx)
	var sz: float = fz * fz * (3.0 - 2.0 * fz)
	var a: float = lerpf(_hash_noise(ix, iz), _hash_noise(ix + 1, iz), sx)
	var b: float = lerpf(_hash_noise(ix, iz + 1), _hash_noise(ix + 1, iz + 1), sx)
	return lerpf(a, b, sz) * 2.0 - 1.0

static func terrain_height(x: float, z: float) -> float:
	var broad: float = _smooth_noise(x * 0.012, z * 0.012) * 5.4
	var medium: float = _smooth_noise(x * 0.038 + 30.0, z * 0.038 - 12.0) * 1.65
	var detail: float = _smooth_noise(x * 0.11, z * 0.11) * 0.32
	var ridge: float = maxf(0.0, _smooth_noise(x * 0.019 - 8.0, z * 0.019 + 19.0)) * 2.4
	return broad + medium + detail + ridge

func _create_materials() -> void:
	trunk_material = _material(Color(0.33, 0.25, 0.17), 0.96)
	bark_material = _material(Color(0.44, 0.34, 0.22), 1.0)
	leaf_materials = [
		_material(Color(0.16, 0.29, 0.18), 0.94),
		_material(Color(0.21, 0.36, 0.20), 0.96),
		_material(Color(0.27, 0.42, 0.24), 0.98),
		_material(Color(0.13, 0.25, 0.16), 1.0)
	]
	fern_materials = [
		_material(Color(0.19, 0.35, 0.21), 0.9),
		_material(Color(0.28, 0.45, 0.26), 0.9),
		_material(Color(0.14, 0.29, 0.19), 0.95)
	]
	for material in fern_materials:
		material.cull_mode = BaseMaterial3D.CULL_DISABLED
	rock_materials = [
		_material(Color(0.47, 0.48, 0.43), 0.96),
		_material(Color(0.40, 0.42, 0.38), 1.0)
	]

func _material(color: Color, roughness: float) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = roughness
	return material

func _create_terrain() -> void:
	var surface := SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)
	for z_index in range(GRID + 1):
		for x_index in range(GRID + 1):
			var x: float = -HALF_WORLD + float(x_index) * WORLD_SIZE / GRID
			var z: float = -HALF_WORLD + float(z_index) * WORLD_SIZE / GRID
			var y: float = terrain_height(x, z)
			var variation: float = _smooth_noise(x * 0.16, z * 0.16) * 0.035
			var color: Color
			if y > 5.5:
				color = Color(0.34 + variation, 0.36 + variation, 0.24)
			elif y < -2.0:
				color = Color(0.24 + variation, 0.34 + variation, 0.19)
			else:
				color = Color(0.29 + variation, 0.39 + variation, 0.22)
			surface.set_color(color)
			surface.add_vertex(Vector3(x, y, z))
	surface.index()
	var row: int = GRID + 1
	for z_index in range(GRID):
		for x_index in range(GRID):
			var a: int = z_index * row + x_index
			var b: int = a + row
			surface.add_index(a)
			surface.add_index(b)
			surface.add_index(a + 1)
			surface.add_index(a + 1)
			surface.add_index(b)
			surface.add_index(b + 1)
	surface.generate_normals()
	var terrain_mesh: ArrayMesh = surface.commit()
	var ground := MeshInstance3D.new()
	ground.name = "Terrain"
	ground.mesh = terrain_mesh
	ground.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(ground)

	var terrain_body := StaticBody3D.new()
	terrain_body.name = "TerrainCollision"
	var terrain_collision := CollisionShape3D.new()
	var concave := ConcavePolygonShape3D.new()
	concave.set_faces(terrain_mesh.get_faces())
	terrain_collision.shape = concave
	terrain_body.add_child(terrain_collision)
	add_child(terrain_body)

func _create_forest() -> void:
	for index in range(95):
		var x: float = random.randf_range(-HALF_WORLD + 9.0, HALF_WORLD - 9.0)
		var z: float = random.randf_range(-HALF_WORLD + 9.0, HALF_WORLD - 9.0)
		if Vector2(x, z).length() < 12.0:
			continue
		_create_tree(x, z, random.randf_range(0.8, 1.55))

	for index in range(260):
		var x: float = random.randf_range(-HALF_WORLD + 5.0, HALF_WORLD - 5.0)
		var z: float = random.randf_range(-HALF_WORLD + 5.0, HALF_WORLD - 5.0)
		if Vector2(x, z).length() < 7.0:
			continue
		_create_fern(x, z, random.randf_range(0.45, 1.25))

	for index in range(95):
		var x: float = random.randf_range(-HALF_WORLD + 7.0, HALF_WORLD - 7.0)
		var z: float = random.randf_range(-HALF_WORLD + 7.0, HALF_WORLD - 7.0)
		_create_rock(x, z, random.randf_range(0.45, 1.7))

func _create_tree(x: float, z: float, scale_factor: float) -> void:
	var group := Node3D.new()
	group.position = Vector3(x, terrain_height(x, z), z)
	group.scale = Vector3.ONE * scale_factor
	add_child(group)

	var height: float = random.randf_range(9.0, 17.0)
	var radius: float = random.randf_range(0.42, 0.66)
	var trunk_mesh := CylinderMesh.new()
	trunk_mesh.top_radius = radius * 0.78
	trunk_mesh.bottom_radius = radius
	trunk_mesh.height = height
	trunk_mesh.radial_segments = 12
	var trunk := MeshInstance3D.new()
	trunk.mesh = trunk_mesh
	trunk.material_override = trunk_material
	trunk.position.y = height * 0.5
	trunk.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
	group.add_child(trunk)

	for root_index in range(3):
		var angle: float = float(root_index) * TAU / 3.0 + random.randf_range(-0.35, 0.35)
		var root_mesh := CylinderMesh.new()
		root_mesh.top_radius = 0.05
		root_mesh.bottom_radius = 0.23
		root_mesh.height = 2.5
		var root := MeshInstance3D.new()
		root.mesh = root_mesh
		root.material_override = bark_material
		root.position = Vector3(cos(angle) * 0.75, 0.48, sin(angle) * 0.75)
		root.rotation.z = cos(angle) * 0.42
		root.rotation.x = sin(angle) * 0.42
		group.add_child(root)

	var crown_count: int = random.randi_range(4, 5)
	for crown_index in range(crown_count):
		var crown_mesh := SphereMesh.new()
		crown_mesh.radius = 1.0
		crown_mesh.height = 2.0
		var crown := MeshInstance3D.new()
		crown.mesh = crown_mesh
		crown.material_override = leaf_materials[random.randi_range(0, leaf_materials.size() - 1)]
		crown.position = Vector3(random.randf_range(-2.4, 2.4), height + random.randf_range(-0.1, 2.7), random.randf_range(-2.4, 2.4))
		crown.scale = Vector3(random.randf_range(2.0, 2.7), random.randf_range(1.5, 2.1), random.randf_range(1.9, 2.6))
		crown.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
		group.add_child(crown)

	var body := StaticBody3D.new()
	var collision := CollisionShape3D.new()
	var capsule := CapsuleShape3D.new()
	capsule.radius = radius + 0.18
	capsule.height = height
	collision.shape = capsule
	collision.position.y = height * 0.5
	body.add_child(collision)
	group.add_child(body)

func _create_fern(x: float, z: float, scale_factor: float) -> void:
	var group := Node3D.new()
	group.position = Vector3(x, terrain_height(x, z) + 0.06, z)
	group.scale = Vector3.ONE * scale_factor
	add_child(group)

	var mesh := _build_fern_mesh(random.randi_range(9, 13))
	var leaves := MeshInstance3D.new()
	leaves.mesh = mesh
	leaves.material_override = fern_materials[random.randi_range(0, fern_materials.size() - 1)]
	group.add_child(leaves)

func _build_fern_mesh(leaf_count: int) -> ArrayMesh:
	var surface := SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)
	for leaf_index in range(leaf_count):
		var angle: float = float(leaf_index) / float(leaf_count) * TAU + random.randf_range(-0.18, 0.18)
		var length: float = random.randf_range(1.0, 2.15)
		var width: float = random.randf_range(0.12, 0.22)
		var side := Vector3(-sin(angle), 0.08, cos(angle)).normalized()
		var tip := Vector3(cos(angle) * length, length * 0.12, sin(angle) * length)
		var mid := Vector3(cos(angle) * length * 0.42, length * 0.38, sin(angle) * length * 0.42)
		var base := Vector3.ZERO
		var left_mid: Vector3 = mid + side * width
		var right_mid: Vector3 = mid - side * width
		surface.add_vertex(base)
		surface.add_vertex(left_mid)
		surface.add_vertex(tip)
		surface.add_vertex(base)
		surface.add_vertex(tip)
		surface.add_vertex(right_mid)
	surface.generate_normals()
	return surface.commit()

func _create_rock(x: float, z: float, scale_factor: float) -> void:
	var group := Node3D.new()
	group.position = Vector3(x, terrain_height(x, z) + scale_factor * 0.38, z)
	group.rotation = Vector3(random.randf_range(0.0, 0.5), random.randf_range(0.0, TAU), random.randf_range(0.0, 0.4))
	add_child(group)

	var rock_mesh := SphereMesh.new()
	rock_mesh.radius = 1.0
	rock_mesh.height = 2.0
	var rock := MeshInstance3D.new()
	rock.mesh = rock_mesh
	rock.material_override = rock_materials[random.randi_range(0, rock_materials.size() - 1)]
	rock.scale = Vector3(scale_factor * random.randf_range(0.9, 1.4), scale_factor * random.randf_range(0.55, 0.9), scale_factor * random.randf_range(0.8, 1.25))
	rock.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
	group.add_child(rock)

	var body := StaticBody3D.new()
	var collision := CollisionShape3D.new()
	var sphere := SphereShape3D.new()
	sphere.radius = scale_factor * 0.72 + 0.35
	collision.shape = sphere
	body.add_child(collision)
	group.add_child(body)

func _create_boundaries() -> void:
	_add_boundary(Vector3(-HALF_WORLD - 1.0, 20.0, 0.0), Vector3(2.0, 60.0, WORLD_SIZE + 4.0))
	_add_boundary(Vector3(HALF_WORLD + 1.0, 20.0, 0.0), Vector3(2.0, 60.0, WORLD_SIZE + 4.0))
	_add_boundary(Vector3(0.0, 20.0, -HALF_WORLD - 1.0), Vector3(WORLD_SIZE + 4.0, 60.0, 2.0))
	_add_boundary(Vector3(0.0, 20.0, HALF_WORLD + 1.0), Vector3(WORLD_SIZE + 4.0, 60.0, 2.0))

func _add_boundary(boundary_position: Vector3, boundary_size: Vector3) -> void:
	var body := StaticBody3D.new()
	body.position = boundary_position
	var collision := CollisionShape3D.new()
	var box := BoxShape3D.new()
	box.size = boundary_size
	collision.shape = box
	body.add_child(collision)
	add_child(body)
