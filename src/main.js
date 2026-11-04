import * as THREE from "three";
import "./style.css";

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

function addTree(x, z, scale, random) {
  const y = terrainHeight(x, z);
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.scale.setScalar(scale);
  const height = 8 + random() * 7;
  const radius = 0.38 + random() * 0.25;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.72, radius * 1.35, height, 12, 3), trunkMaterial);
  trunk.position.y = height / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  for (let r = 0; r < 4; r++) {
    const angle = r * Math.PI / 2 + random() * 0.4;
    const root = new THREE.Mesh(new THREE.ConeGeometry(0.42, 3.5, 5), barkLight);
    root.position.set(Math.cos(angle) * 0.95, 0.55, Math.sin(angle) * 0.95);
    root.rotation.z = Math.cos(angle) * 0.42;
    root.rotation.x = Math.sin(angle) * 0.42;
    root.castShadow = true;
    group.add(root);
  }

  const crownY = height + 1.1;
  const crownCount = 7 + Math.floor(random() * 4);
  for (let i = 0; i < crownCount; i++) {
    const crown = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.3 + random() * 1.5, 2),
      leafMaterials[Math.floor(random() * leafMaterials.length)]
    );
    crown.position.set((random() - 0.5) * 5.5, crownY + (random() - 0.5) * 3.2, (random() - 0.5) * 5.5);
    crown.scale.set(1.15, 0.75 + random() * 0.3, 1.05);
    crown.castShadow = true;
    crown.receiveShadow = true;
    group.add(crown);
  }
  scene.add(group);
}

function addFern(x, z, scale, random) {
  const y = terrainHeight(x, z) + 0.06;
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.scale.setScalar(scale);
  const leafCount = 9 + Math.floor(random() * 5);
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
    const verts = [];
    const indices = [];
    const segments = 12;
    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      const p = curve.getPoint(t);
      const w = Math.sin(Math.PI * t) * width;
      const side = new THREE.Vector3(-Math.sin(angle), 0.08, Math.cos(angle)).normalize();
      verts.push(p.x + side.x * w, p.y + w * 0.28, p.z + side.z * w);
      verts.push(p.x - side.x * w, p.y - w * 0.28, p.z - side.z * w);
      if (j < segments) {
        const a = j * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const leaf = new THREE.Mesh(geometry, fernMaterials[Math.floor(random() * fernMaterials.length)]);
    leaf.castShadow = true;
    group.add(leaf);
  }
  scene.add(group);
}

function addRock(x, z, scale, random) {
  const rock = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1, 3),
    rockMaterials[Math.floor(random() * rockMaterials.length)]
  );
  rock.position.set(x, terrainHeight(x, z) + scale * 0.38, z);
  rock.scale.set(scale * (0.9 + random() * 0.5), scale * (0.55 + random() * 0.35), scale * (0.8 + random() * 0.45));
  rock.rotation.set(random() * 0.5, random() * Math.PI, random() * 0.4);
  rock.castShadow = true;
  rock.receiveShadow = true;
  scene.add(rock);
}

function seededRandomFactory(initial) {
  let state = initial >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const random = seededRandomFactory(seed);
for (let i = 0; i < 150; i++) {
  const x = (random() - 0.5) * (WORLD_SIZE - 18);
  const z = (random() - 0.5) * (WORLD_SIZE - 18);
  if (Math.hypot(x, z) < 12) continue;
  addTree(x, z, 0.8 + random() * 0.75, random);
}
for (let i = 0; i < 560; i++) {
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
  eyeHeight: 1.72
};
const keys = new Set();
let locked = false;
let lastTime = performance.now();

function requestLock() {
  renderer.domElement.requestPointerLock();
}

startButton.addEventListener("click", requestLock);
resumeButton.addEventListener("click", requestLock);

document.addEventListener("pointerlockchange", () => {
  locked = document.pointerLockElement === renderer.domElement;
  startScreen.classList.toggle("hidden", locked);
  pauseScreen.classList.toggle("hidden", locked || !hasStarted);
  hud.classList.toggle("active", locked);
  if (locked) hasStarted = true;
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
  const speed = sprinting ? player.sprintSpeed : player.speed;
  player.velocity.x = THREE.MathUtils.damp(player.velocity.x, direction.x * speed, 12, delta);
  player.velocity.z = THREE.MathUtils.damp(player.velocity.z, direction.z * speed, 12, delta);

  camera.position.x += player.velocity.x * delta;
  camera.position.z += player.velocity.z * delta;
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -HALF_WORLD + 3, HALF_WORLD - 3);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -HALF_WORLD + 3, HALF_WORLD - 3);
  const floor = terrainHeight(camera.position.x, camera.position.z) + player.eyeHeight;
  camera.position.y = THREE.MathUtils.damp(camera.position.y, floor, 16, delta);
  camera.rotation.order = "YXZ";
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;
}

function animate(now) {
  requestAnimationFrame(animate);
  const delta = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  if (locked) updatePlayer(delta);
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
});
