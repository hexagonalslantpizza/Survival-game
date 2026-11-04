import * as THREE from "three";
import "./style.css";
import { createSurvivalSystems } from "./systems/survival.js";

const mount = document.querySelector("#game");
const startScreen = document.querySelector("#start-screen");
const pauseScreen = document.querySelector("#pause-screen");
const startButton = document.querySelector("#start-button");
const resumeButton = document.querySelector("#resume-button");
const hud = document.querySelector("#hud");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9aa99a);
scene.fog = new THREE.FogExp2(0x9aa99a, 0.009);

const camera = new THREE.PerspectiveCamera(76, window.innerWidth / window.innerHeight, 0.1, 420);
camera.position.set(0, 2.1, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
mount.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xdce8d2, 0x34402a, 1.55);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffe4b7, 2.1);
sun.position.set(-65, 100, 35);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -90;
sun.shadow.camera.right = 90;
sun.shadow.camera.top = 90;
sun.shadow.camera.bottom = -90;
sun.shadow.bias = -0.00015;
scene.add(sun);

const WORLD_SIZE = 300;
const HALF_WORLD = WORLD_SIZE / 2;
const GRID = 180;
const seed = 82471;

function hash(x, z) {
  let n = Math.imul(x, 374761393) + Math.imul(z, 668265263) + seed;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function smoothNoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const sx = fx * fx * (3 - 2 * fx), sz = fz * fz * (3 - 2 * fz);
  const a = THREE.MathUtils.lerp(hash(ix, iz), hash(ix + 1, iz), sx);
  const b = THREE.MathUtils.lerp(hash(ix, iz + 1), hash(ix + 1, iz + 1), sx);
  return THREE.MathUtils.lerp(a, b, sz) * 2 - 1;
}

function terrainHeight(x, z) {
  const broad = smoothNoise(x * 0.012, z * 0.012) * 5.4;
  const medium = smoothNoise(x * 0.038 + 30, z * 0.038 - 12) * 1.65;
  const detail = smoothNoise(x * 0.11, z * 0.11) * 0.32;
  const ridge = Math.max(0, smoothNoise(x * 0.019 - 8, z * 0.019 + 19)) * 2.4;
  return broad + medium + detail + ridge;
}

const terrainGeometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, GRID, GRID);
terrainGeometry.rotateX(-Math.PI / 2);
const positions = terrainGeometry.attributes.position;
const colors = [];
const color = new THREE.Color();

for (let i = 0; i < positions.count; i++) {
  const x = positions.getX(i);
  const z = positions.getZ(i);
  const y = terrainHeight(x, z);
  positions.setY(i, y);
  const variation = smoothNoise(x * 0.16, z * 0.16) * 0.035;
  if (y > 5.5) color.setRGB(0.34 + variation, 0.36 + variation, 0.24);
  else if (y < -2.0) color.setRGB(0.24 + variation, 0.34 + variation, 0.19);
  else color.setRGB(0.29 + variation, 0.39 + variation, 0.22);
  colors.push(color.r, color.g, color.b);
}
terrainGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
terrainGeometry.computeVertexNormals();

const ground = new THREE.Mesh(
  terrainGeometry,
  new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 })
);
ground.receiveShadow = true;
scene.add(ground);

const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x55402c, roughness: 0.96 });
const barkLight = new THREE.MeshStandardMaterial({ color: 0x71583a, roughness: 1 });
const leafMaterials = [
  new THREE.MeshStandardMaterial({ color: 0x294b2d, roughness: 0.94 }),
  new THREE.MeshStandardMaterial({ color: 0x365c34, roughness: 0.96 }),
  new THREE.MeshStandardMaterial({ color: 0x456b3c, roughness: 0.98 }),
  new THREE.MeshStandardMaterial({ color: 0x233f2a, roughness: 1 })
];
const fernMaterials = [
  new THREE.MeshStandardMaterial({ color: 0x315b35, side: THREE.DoubleSide, roughness: 0.9 }),
  new THREE.MeshStandardMaterial({ color: 0x477343, side: THREE.DoubleSide, roughness: 0.9 }),
  new THREE.MeshStandardMaterial({ color: 0x244a31, side: THREE.DoubleSide, roughness: 0.95 })
];
const rockMaterials = [
  new THREE.MeshStandardMaterial({ color: 0x77796d, roughness: 0.96 }),
  new THREE.MeshStandardMaterial({ color: 0x656b62, roughness: 1 })
];

const solidObstacles = [];
const trees = [];
const sharedTrunkGeometry = new THREE.CylinderGeometry(1, 1.28, 1, 12, 3);
const sharedRootGeometry = new THREE.ConeGeometry(1, 1, 5);
const sharedCanopyGeometry = new THREE.IcosahedronGeometry(1, 3);
const sharedFernMaterial = fernMaterials[1];
const sharedRockGeometry = new THREE.IcosahedronGeometry(1, 3);

function addTree(x, z, scale, random) {
  const y = terrainHeight(x, z);
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.scale.setScalar(scale);
  const height = 9 + random() * 8;
  const radius = 0.42 + random() * 0.24;

  const trunk = new THREE.Mesh(sharedTrunkGeometry, trunkMaterial);
  trunk.scale.set(radius, height, radius);
  trunk.position.y = height / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  for (let r = 0; r < 3; r++) {
    const angle = r * Math.PI * 2 / 3 + random() * 0.35;
    const root = new THREE.Mesh(sharedRootGeometry, barkLight);
    root.position.set(Math.cos(angle) * 0.8, 0.48, Math.sin(angle) * 0.8);
    root.scale.set(0.32, 3.0, 0.32);
    root.rotation.z = Math.cos(angle) * 0.42;
    root.rotation.x = Math.sin(angle) * 0.42;
    root.castShadow = true;
    group.add(root);
  }

  const crownY = height + 1.3;
  const crownCount = 4 + Math.floor(random() * 2);
  for (let i = 0; i < crownCount; i++) {
    const crown = new THREE.Mesh(
      sharedCanopyGeometry,
      leafMaterials[Math.floor(random() * leafMaterials.length)]
    );
    crown.position.set((random() - 0.5) * 4.8, crownY + (random() - 0.5) * 2.8, (random() - 0.5) * 4.8);
    crown.scale.set(2.0 + random() * 0.7, 1.5 + random() * 0.6, 1.9 + random() * 0.7);
    crown.castShadow = true;
    crown.receiveShadow = true;
    group.add(crown);
  }
  scene.add(group);
  const obstacle = { x, z, radius: radius * scale + 0.5 };
  solidObstacles.push(obstacle);
  trees.push({ group, x, z, obstacle, harvested: false });
}
function addFern(x, z, scale, random) {
  const y = terrainHeight(x, z) + 0.06;
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.scale.setScalar(scale);
  const leafCount = 9 + Math.floor(random() * 5);
  const verts = [];
  const indices = [];
  const segments = 12;

  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2 + random() * 0.18;
    const length = 1.0 + random() * 1.15;
    const width = 0.12 + random() * 0.10;
    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.cos(angle) * length * 0.42, length * 0.38, Math.sin(angle) * length * 0.42),
      new THREE.Vector3(Math.cos(angle) * length, length * 0.12, Math.sin(angle) * length)
    ];
    const curve = new THREE.QuadraticBezierCurve3(points[0], points[1], points[2]);
    const side = new THREE.Vector3(-Math.sin(angle), 0.08, Math.cos(angle)).normalize();
    const vertexOffset = verts.length / 3;

    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      const p = curve.getPoint(t);
      const w = Math.sin(Math.PI * t) * width;
      verts.push(p.x + side.x * w, p.y + w * 0.28, p.z + side.z * w);
      verts.push(p.x - side.x * w, p.y - w * 0.28, p.z - side.z * w);
      if (j < segments) {
        const a = vertexOffset + j * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const leaves = new THREE.Mesh(geometry, sharedFernMaterial);
  leaves.frustumCulled = true;
  group.add(leaves);
  scene.add(group);
}
function addRock(x, z, scale, random) {
  const rock = new THREE.Mesh(
    sharedRockGeometry,
    rockMaterials[Math.floor(random() * rockMaterials.length)]
  );
  rock.position.set(x, terrainHeight(x, z) + scale * 0.38, z);
  rock.scale.set(scale * (0.9 + random() * 0.5), scale * (0.55 + random() * 0.35), scale * (0.8 + random() * 0.45));
  rock.rotation.set(random() * 0.5, random() * Math.PI, random() * 0.4);
  rock.castShadow = true;
  rock.receiveShadow = true;
  scene.add(rock);
  solidObstacles.push({ x, z, radius: scale * 0.72 + 0.35 });
}

function seededRandomFactory(initial) {
  let state = initial >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const random = seededRandomFactory(seed);
for (let i = 0; i < 95; i++) {
  const x = (random() - 0.5) * (WORLD_SIZE - 18);
  const z = (random() - 0.5) * (WORLD_SIZE - 18);
  if (Math.hypot(x, z) < 12) continue;
  addTree(x, z, 0.8 + random() * 0.75, random);
}
for (let i = 0; i < 260; i++) {
  const x = (random() - 0.5) * (WORLD_SIZE - 10);
  const z = (random() - 0.5) * (WORLD_SIZE - 10);
  if (Math.hypot(x, z) < 7) continue;
  addFern(x, z, 0.45 + random() * 0.8, random);
}
for (let i = 0; i < 95; i++) {
  const x = (random() - 0.5) * (WORLD_SIZE - 14);
  const z = (random() - 0.5) * (WORLD_SIZE - 14);
  addRock(x, z, 0.45 + random() * 1.25, random);
}

camera.position.set(0, terrainHeight(0, 8) + 1.72, 8);
const player = {
  velocity: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  speed: 5.0,
  sprintSpeed: 8.0,
  eyeHeight: 1.72,
  verticalVelocity: 0,
  grounded: true
};
const keys = new Set();
let locked = false;
const survival = createSurvivalSystems({ scene, camera, player, renderer, terrainHeight, worldSize: WORLD_SIZE, trees, solidObstacles, isLocked: () => locked });
let lastTime = performance.now();

function requestLock() {
  renderer.domElement.requestPointerLock();
}

startButton.addEventListener("click", requestLock);
resumeButton.addEventListener("click", requestLock);

document.addEventListener("pointerlockchange", () => {
  locked = document.pointerLockElement === renderer.domElement;
  startScreen.classList.toggle("hidden", locked || hasStarted);
  pauseScreen.classList.toggle("hidden", locked || !hasStarted);
  hud.classList.toggle("active", locked);
  if (locked) hasStarted = true;
  else keys.clear();
});
let hasStarted = false;

document.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (["KeyW", "KeyA", "KeyS", "KeyD", "Space"].includes(event.code)) event.preventDefault();
});
document.addEventListener("keyup", (event) => keys.delete(event.code));

document.addEventListener("mousemove", (event) => {
  if (!locked) return;
  player.yaw -= event.movementX * 0.0022;
  player.pitch -= event.movementY * 0.0020;
  player.pitch = THREE.MathUtils.clamp(player.pitch, -1.45, 1.45);
});

document.addEventListener("pointerlockerror", () => {
  document.querySelector("#status-message").textContent = "Click ENTER THE FOREST to begin.";
});

function updatePlayer(delta) {
  const forward = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
  const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
  const direction = new THREE.Vector3();
  if (keys.has("KeyW")) direction.add(forward);
  if (keys.has("KeyS")) direction.sub(forward);
  if (keys.has("KeyD")) direction.add(right);
  if (keys.has("KeyA")) direction.sub(right);
  if (direction.lengthSq() > 0) direction.normalize();
  const sprinting = keys.has("ShiftLeft") || keys.has("ShiftRight");
  const speed = sprinting && survival.canSprint() ? player.sprintSpeed * survival.sprintMultiplier() : player.speed;
  survival.consumeSprint(delta, sprinting && direction.lengthSq() > 0);
  player.velocity.x = THREE.MathUtils.damp(player.velocity.x, direction.x * speed, 12, delta);
  player.velocity.z = THREE.MathUtils.damp(player.velocity.z, direction.z * speed, 12, delta);

  let nextX = camera.position.x + player.velocity.x * delta;
  let nextZ = camera.position.z + player.velocity.z * delta;
  nextX = THREE.MathUtils.clamp(nextX, -HALF_WORLD + 3, HALF_WORLD - 3);
  nextZ = THREE.MathUtils.clamp(nextZ, -HALF_WORLD + 3, HALF_WORLD - 3);

  for (const obstacle of solidObstacles) {
    const dx = nextX - obstacle.x;
    const dz = nextZ - obstacle.z;
    const minDistance = obstacle.radius + 0.38;
    const distanceSq = dx * dx + dz * dz;
    if (distanceSq < minDistance * minDistance) {
      const distance = Math.sqrt(distanceSq);
      const pushX = distance > 0.001 ? dx / distance : 1;
      const pushZ = distance > 0.001 ? dz / distance : 0;
      nextX = obstacle.x + pushX * minDistance;
      nextZ = obstacle.z + pushZ * minDistance;
    }
  }

  camera.position.x = nextX;
  camera.position.z = nextZ;
  const floor = terrainHeight(camera.position.x, camera.position.z) + player.eyeHeight;
  if (keys.has("Space") && player.grounded) {
    player.verticalVelocity = 7.5;
    player.grounded = false;
  }
  if (!player.grounded) {
    player.verticalVelocity -= 20 * delta;
    camera.position.y += player.verticalVelocity * delta;
    if (camera.position.y <= floor) {
      const impactSpeed = -player.verticalVelocity;
      camera.position.y = floor;
      player.verticalVelocity = 0;
      player.grounded = true;
      if (impactSpeed > 13) survival.applyFallDamage(impactSpeed);
    }
  } else {
    camera.position.y = THREE.MathUtils.damp(camera.position.y, floor, 16, delta);
  }
  camera.rotation.order = "YXZ";
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;
}

function animate(now) {
  requestAnimationFrame(animate);
  const frameDelta = (now - lastTime) / 1000;
  const delta = Math.min(frameDelta, 0.05);
  lastTime = now;
  if (locked) {
    survival.update(delta, frameDelta);
    updatePlayer(delta);
  }
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
});
