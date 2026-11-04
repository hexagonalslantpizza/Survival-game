import * as THREE from "three";
import { createEcologyState, exposeToAmoebicParasite, absorbCarbohydrates, advanceEcology, emitIndustrialSmoke, exposeToBotflyScent, applyResinToBotfly, completeBotflyExtraction, advanceJaguarState, shouldSpawnJaguar } from "./ecology.js";

export function createSurvivalSystems({ scene, camera, player, renderer, terrainHeight, worldSize, trees, solidObstacles, isLocked }) {
  const state = {
    health: 100, hunger: 100, thirst: 100, stamina: 100, sanity: 100,
    inventory: {}, discoveries: new Set(["Tropical Lowlands"]), journal: [],
    wounds: [], infection: 0, parasites: 0, day: 1, time: 8.5,
    difficulty: "normal", survivalEnabled: true, godMode: false,
    showInventory: false, activePanel: "", buildMode: "", message: "Explore. Press E near something to interact.",
    messageTime: 5, kills: 0, gathered: 0, crafted: 0, damageTaken: 0, fps: 0,
    thirstDamageTimer: 0, hungerDamageTimer: 0, infectionTimer: 0,
    temperature: 28, wetness: 0, fireCount: 0, weather: "clear",
    ecology: createEcologyState()
  };

  const itemInfo = {
    stick: ["Stick", "A fallen branch. Useful for tools and fires."],
    stone: ["Stone", "A rough stone that can be used in basic tools."],
    flint: ["Flint", "A sharp stone useful for primitive tools."],
    fiber: ["Plant Fiber", "Strong plant fibers for bindings and rope."],
    herb: ["Medicinal Herb", "A useful plant for treating minor ailments."],
    fruit: ["Wild Fruit", "Food. Some wild fruit may upset your stomach."],
    coconut: ["Coconut", "Provides food and drink."],
    raw_meat: ["Raw Meat", "Needs cooking before it is safe to eat."],
    cooked_meat: ["Cooked Meat", "A filling meal."],
    hide: ["Animal Hide", "A crafting material."],
    feather: ["Feather", "A light crafting material."],
    rope: ["Rope", "Made from plant fiber."],
    spear: ["Wooden Spear", "A basic hunting and defense tool."],
    bow: ["Primitive Bow", "A simple ranged hunting tool."],
    arrow: ["Arrow", "Ammunition for a bow."],
    bandage: ["Bandage", "Can help treat a wound."],
    clean_water: ["Clean Water", "Safe drinking water."],
    dirty_water: ["Unfiltered Water", "May contain parasites."],
    log: ["Wood Log", "Heavy wood for building."],
    axe: ["Stone Axe", "A basic tool for chopping down trees."],
    campfire: ["Campfire", "A place to cook food and stay warm."],
    shelter: ["Leaf Shelter", "A simple place to rest."]
  };

  const recipes = [
    { id: "rope", name: "Rope", needs: { fiber: 3 }, gives: 1, description: "Twist plant fibers together." },
    { id: "spear", name: "Wooden Spear", needs: { stick: 2, flint: 1, fiber: 2 }, gives: 1, description: "A basic hunting tool." },
    { id: "axe", name: "Stone Axe", needs: { stick: 1, flint: 2, rope: 1 }, gives: 1, description: "A basic tool for chopping trees." },
    { id: "bow", name: "Primitive Bow", needs: { stick: 3, rope: 1 }, gives: 1, description: "A simple ranged tool." },
    { id: "arrow", name: "Arrows x3", needs: { stick: 1, feather: 2, flint: 1 }, gives: 3, description: "Three basic arrows." },
    { id: "bandage", name: "Bandage", needs: { fiber: 2, herb: 1 }, gives: 1, description: "A clean plant-fiber dressing." },
    { id: "campfire", name: "Campfire Kit", needs: { stick: 5, stone: 3, fiber: 1 }, gives: 1, description: "A portable fire kit." },
    { id: "shelter", name: "Leaf Shelter Kit", needs: { log: 3, fiber: 4, rope: 2 }, gives: 1, description: "Materials for a simple shelter." }
  ];

  const animals = [];
  const resources = [];
  const placedObjects = [];
  const scentSources = [];
  let jaguarSpawnCheckTimer = 0;
  const ui = document.createElement("div");
  ui.id = "survival-ui";
  document.body.appendChild(ui);
  const style = document.createElement("style");
  style.textContent = [
    "#survival-ui{position:fixed;inset:0;z-index:8;pointer-events:none;font:13px Arial,sans-serif;color:#edf1e7}",
    ".surv-top{position:absolute;top:62px;left:28px;width:220px;padding:12px 14px;background:rgba(10,18,13,.76);border:1px solid #81927466;border-radius:5px}",
    ".surv-stat{display:grid;grid-template-columns:64px 1fr 34px;gap:7px;align-items:center;margin:7px 0;font-size:10px;letter-spacing:.08em}",
    ".surv-track{height:7px;background:#ffffff20;border-radius:8px;overflow:hidden}.surv-fill{height:100%;width:100%;background:#a8bf8a;transition:width .15s}",
    ".surv-bottom{position:absolute;bottom:68px;left:50%;transform:translateX(-50%);padding:8px 13px;background:#101a13c9;border:1px solid #ffffff22;border-radius:4px;font-size:11px;white-space:nowrap}",
    ".surv-hint{position:absolute;bottom:102px;left:50%;transform:translateX(-50%);font-size:11px;color:#f4f1df;text-shadow:0 1px 5px #000;white-space:nowrap}",
    ".surv-panel{pointer-events:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:min(720px,calc(100vw - 32px));max-height:min(78vh,720px);overflow:auto;background:rgba(12,20,15,.97);border:1px solid #91a47b88;border-radius:8px;padding:20px;box-shadow:0 18px 70px #000a}",
    ".surv-panel h2{font:500 26px Arial,sans-serif;letter-spacing:.12em;margin:0 0 6px}.surv-sub{color:#aebba7;font-size:11px;margin-bottom:16px}",
    ".surv-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px}",
    ".surv-card{background:#ffffff0c;border:1px solid #ffffff20;border-radius:5px;padding:10px}",
    ".surv-card strong{display:block;font-size:12px;margin-bottom:5px}.surv-card small{display:block;color:#aebba7;line-height:1.4;margin-bottom:8px}",
    ".surv-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}",
    ".surv-btn{pointer-events:auto;background:#9caf83;color:#142017;border:0;border-radius:3px;padding:8px 11px;font-size:10px;font-weight:700;letter-spacing:.06em;cursor:pointer}",
    ".surv-btn.secondary{background:#334537;color:#e8eee1}.surv-btn:disabled{opacity:.35;cursor:not-allowed}",
    ".surv-close{float:right;background:#334537;color:white;border:0;border-radius:3px;padding:7px 10px;cursor:pointer}",
    ".surv-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px}.surv-item{padding:8px;background:#ffffff0c;border:1px solid #ffffff18;border-radius:4px}",
    ".surv-item span{float:right;color:#c7d7b4}.surv-debug{pointer-events:auto;position:absolute;inset:3vh 3vw;background:rgba(5,10,8,.97);border:1px solid #9fb58b;padding:16px;overflow:auto;border-radius:6px;box-shadow:0 0 0 100vmax #0009}",
    ".surv-debug h2{font:600 22px Arial;margin:0 0 8px;color:#d7e5c8}.debug-columns{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}",
    ".debug-box{padding:11px;background:#ffffff0a;border:1px solid #ffffff22;border-radius:4px}.debug-box h3{font-size:11px;letter-spacing:.1em;color:#b8caa5;margin:0 0 9px}",
    ".debug-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:7px 0;font-size:11px}.debug-row input[type=range]{width:105px}.debug-row input[type=number],.debug-row select{width:100px;background:#1e2c22;color:#fff;border:1px solid #63765c;padding:5px}",
    ".debug-actions{display:flex;gap:5px;flex-wrap:wrap}.debug-actions button{font-size:10px;padding:7px 9px}",
    ".surv-toast{position:absolute;top:18%;left:50%;transform:translateX(-50%);background:#101a13e8;border:1px solid #a4b98d;padding:9px 14px;border-radius:4px;font-size:12px;opacity:0;transition:opacity .2s}",
    "@media(max-width:600px){.surv-top{top:54px;left:10px;width:190px}.surv-panel{padding:14px}.surv-bottom{bottom:45px}}"
  ].join("\n");
  document.head.appendChild(style);

  const rainCount = 420;
  const rainPositions = new Float32Array(rainCount * 3);
  for (let i = 0; i < rainCount; i++) {
    rainPositions[i * 3] = camera.position.x + (Math.random() * 44 - 22);
    rainPositions[i * 3 + 1] = camera.position.y + (Math.random() * 22 + 4);
    rainPositions[i * 3 + 2] = camera.position.z + (Math.random() * 44 - 22);
  }
  const rainGeometry = new THREE.BufferGeometry();
  rainGeometry.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));
  const rain = new THREE.Points(rainGeometry, new THREE.PointsMaterial({ color: 0xb8d8e4, size: 0.075, transparent: true, opacity: 0.55, depthWrite: false }));
  rain.visible = false;
  scene.add(rain);

  const topHud = document.createElement("div");
  topHud.className = "surv-top";
  topHud.innerHTML = '<div style="font-size:10px;letter-spacing:.16em;color:#bdcba9;margin-bottom:9px">SURVIVAL STATUS</div><div id="surv-bars"></div><div id="surv-conditions" style="font-size:10px;color:#d0b98e;margin-top:8px"></div>';
  ui.appendChild(topHud);
  const hint = document.createElement("div");
  hint.className = "surv-hint";
  ui.appendChild(hint);
  const toast = document.createElement("div");
  toast.className = "surv-toast";
  ui.appendChild(toast);
  const bottom = document.createElement("div");
  bottom.className = "surv-bottom";
  ui.appendChild(bottom);

  topHud.style.display = "none";
  hint.style.display = "none";
  bottom.style.display = "none";
  function syncHudVisibility() {
    const visible = isLocked();
    topHud.style.display = visible ? "block" : "none";
    hint.style.display = visible ? "block" : "none";
    bottom.style.display = visible ? "block" : "none";
  }
  document.addEventListener("pointerlockchange", syncHudVisibility);
  const panelRoot = document.createElement("div");
  ui.appendChild(panelRoot);
  const debugRoot = document.createElement("div");
  ui.appendChild(debugRoot);
  topHud.style.display = "none";
  hint.style.display = "none";
  bottom.style.display = "none";
  function syncHudVisibility() {
    const visible = isLocked();
    topHud.style.display = visible ? "block" : "none";
    hint.style.display = visible ? "block" : "none";
    bottom.style.display = visible ? "block" : "none";
  }
  document.addEventListener("pointerlockchange", syncHudVisibility);

  function notify(message) {
    state.message = message;
    state.messageTime = 3;
    toast.textContent = message;
    toast.style.opacity = "1";
  }
  function addItem(id, amount = 1) {
    state.inventory[id] = (state.inventory[id] || 0) + amount;
    state.gathered += 1;
  }
  function count(id) { return state.inventory[id] || 0; }
  function hasItems(needs) {
    return Object.entries(needs).every(([id, amount]) => count(id) >= amount);
  }
  function spendItems(needs) {
    for (const [id, amount] of Object.entries(needs)) {
      state.inventory[id] = Math.max(0, count(id) - amount);
    }
  }
  function discover(name, description) {
    if (state.discoveries.has(name)) return;
    state.discoveries.add(name);
    state.journal.push({ name, description, day: state.day });
    notify("Journal updated: " + name);
  }
  function makePanel(title, subtitle, content) {
    if (isLocked()) document.exitPointerLock();
    panelRoot.innerHTML = "";
    const panel = document.createElement("section");
    panel.className = "surv-panel";
    const close = document.createElement("button");
    close.className = "surv-close";
    close.textContent = "CLOSE";
    close.addEventListener("click", closePanel);
    panel.appendChild(close);
    const heading = document.createElement("h2");
    heading.textContent = title;
    panel.appendChild(heading);
    const sub = document.createElement("div");
    sub.className = "surv-sub";
    sub.textContent = subtitle;
    panel.appendChild(sub);
    panel.appendChild(content);
    panelRoot.appendChild(panel);
    state.activePanel = title;
  }
  function closePanel() {
    panelRoot.innerHTML = "";
    debugRoot.innerHTML = "";
    state.activePanel = "";
    state.showInventory = false;
  }
  function makeCard(title, description, buttonText, action, disabled = false) {
    const card = document.createElement("div");
    card.className = "surv-card";
    const strong = document.createElement("strong");
    strong.textContent = title;
    const small = document.createElement("small");
    small.textContent = description;
    const button = document.createElement("button");
    button.className = "surv-btn";
    button.textContent = buttonText;
    button.disabled = disabled;
    button.addEventListener("click", action);
    card.append(strong, small, button);
    return card;
  }

  function openInventory() {
    const content = document.createElement("div");
    const list = document.createElement("div");
    list.className = "surv-list";
    const entries = Object.entries(state.inventory).filter(([, amount]) => amount > 0);
    if (!entries.length) list.textContent = "Your backpack is empty. Explore and gather materials with E.";
    for (const [id, amount] of entries) {
      const item = document.createElement("div");
      item.className = "surv-item";
      const info = itemInfo[id] || [id, "A gathered item."];
      item.textContent = info[0];
      const countEl = document.createElement("span");
      countEl.textContent = "x" + amount;
      item.appendChild(countEl);
      list.appendChild(item);
    }
    content.appendChild(list);
    const actions = document.createElement("div");
    actions.className = "surv-actions";
    actions.append(
      makeCard("Eat fruit", "Eat one wild fruit. Restores some hunger.", "EAT", () => useItem("fruit"), count("fruit") < 1),
      makeCard("Drink coconut", "Drink coconut water and eat its flesh.", "USE", () => useItem("coconut"), count("coconut") < 1),
      makeCard("Drink clean water", "Restores thirst safely.", "DRINK", () => useItem("clean_water"), count("clean_water") < 1),
      makeCard("Drink unfiltered water", "Restores thirst but may cause parasites.", "DRINK", () => useItem("dirty_water"), count("dirty_water") < 1),
      makeCard("Eat cooked meat", "A filling meal.", "EAT", () => useItem("cooked_meat"), count("cooked_meat") < 1),
      makeCard("Treat a wound", "Use a bandage to treat an injury.", "TREAT", () => useItem("bandage"), count("bandage") < 1 || state.wounds.length === 0),
      makeCard("Use medicinal herb", "May reduce infection or parasites.", "USE", () => useItem("herb"), count("herb") < 1)
    );
    content.appendChild(actions);
    makePanel("INVENTORY", "Items you have collected. I or TAB closes this panel.", content);
  }

  function useItem(id) {
    if (count(id) < 1) return;
    if (id === "fruit") { state.hunger = Math.min(100, state.hunger + absorbCarbohydrates(state.ecology, 17)); }
    else if (id === "coconut") { state.hunger = Math.min(100, state.hunger + 12); state.thirst = Math.min(100, state.thirst + 22); }
    else if (id === "clean_water") { state.thirst = Math.min(100, state.thirst + 32); }
    else if (id === "dirty_water") {
      state.thirst = Math.min(100, state.thirst + 32);
      if (exposeToAmoebicParasite(state.ecology)) notify("You may have swallowed something harmful. Symptoms may take time to appear.");
      else notify("The water tastes foul. Keep an eye on your condition.");
    } else if (id === "cooked_meat") { state.hunger = Math.min(100, state.hunger + 32); state.health = Math.min(100, state.health + 4); }
    else if (id === "bandage") {
      if (!state.wounds.length) { notify("You have no wounds to bandage."); return; }
      state.wounds.shift();
      state.infection = Math.max(0, state.infection - 12);
    } else if (id === "herb") {
      state.infection = Math.max(0, state.infection - 12);
      state.parasites = Math.max(0, state.parasites - 8);
    } else return;
    state.inventory[id] -= 1;
    notify("Used " + (itemInfo[id] ? itemInfo[id][0] : id) + ".");
    openInventory();
  }

  function openCrafting() {
    const content = document.createElement("div");
    const grid = document.createElement("div");
    grid.className = "surv-grid";
    for (const recipe of recipes) {
      const needsText = Object.entries(recipe.needs).map(([id, amount]) => amount + " " + (itemInfo[id]?.[0] || id)).join(" + ");
      grid.appendChild(makeCard(recipe.name, recipe.description + " Requires: " + needsText, "CRAFT", () => {
        if (!hasItems(recipe.needs)) { notify("Not enough materials."); return; }
        spendItems(recipe.needs);
        addItem(recipe.id, recipe.gives);
        state.crafted += 1;
        discover("Crafting: " + recipe.name, "Recipe: " + needsText + ". Crafted " + recipe.name + ".");
        notify("Crafted " + recipe.name + ".");
        openCrafting();
      }, !hasItems(recipe.needs)));
    }
    content.appendChild(grid);
    makePanel("CRAFTING", "Combine gathered materials into useful equipment. C closes this panel.", content);
  }

  function openJournal() {
    const content = document.createElement("div");
    const intro = document.createElement("p");
    intro.textContent = "Discoveries: " + state.discoveries.size + " • Gathered materials: " + state.gathered + " • Crafted items: " + state.crafted;
    content.appendChild(intro);
    const list = document.createElement("div");
    list.className = "surv-grid";
    for (const name of state.discoveries) {
      const entry = state.journal.find(x => x.name === name);
      list.appendChild(makeCard(name, entry ? entry.description : "A place you have discovered.", entry ? "DAY " + entry.day : "KNOWN", () => {}, true));
    }
    content.appendChild(list);
    makePanel("FIELD JOURNAL", "Notes and discoveries are recorded as you explore.", content);
  }

  function openRest() {
    const content = document.createElement("div");
    content.appendChild(makeCard("Rest until morning", "Sleep at a shelter to recover stamina and some sanity. Time advances.", "REST", () => {
      if (!placedObjects.some(o => o.kind === "shelter" && o.mesh.position.distanceTo(camera.position) < 5)) {
        notify("Build a shelter first.");
        return;
      }
      state.time = 7;
      state.day += 1;
      state.stamina = 100;
      state.sanity = Math.min(100, state.sanity + 24);
      state.health = Math.min(100, state.health + 8);
      notify("You rested. Day " + state.day + " begins.");
      closePanel();
    }));
    makePanel("REST", "A shelter nearby is required to sleep.", content);
  }

  function spawnResource(kind, x, z) {
    const y = terrainHeight(x, z);
    let mesh;
    if (kind === "stick") {
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 1.25, 6), new THREE.MeshStandardMaterial({ color: 0x765334, roughness: 1 }));
      mesh.position.set(x, y + 0.12, z);
      mesh.rotation.z = Math.PI / 2.8;
    } else if (kind === "stone" || kind === "flint") {
      mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(kind === "flint" ? 0.28 : 0.38, 1), new THREE.MeshStandardMaterial({ color: kind === "flint" ? 0x454b4c : 0x777b70, roughness: 1 }));
      mesh.position.set(x, y + 0.22, z);
      mesh.scale.set(1.1, 0.7, 0.9);
    } else if (kind === "fruit" || kind === "coconut") {
      mesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), new THREE.MeshStandardMaterial({ color: kind === "fruit" ? 0xc65b37 : 0x725034, roughness: 0.9 }));
      mesh.position.set(x, y + 0.24, z);
    } else if (kind === "herb" || kind === "fiber") {
      const group = new THREE.Group();
      const material = new THREE.MeshStandardMaterial({ color: kind === "herb" ? 0x76a75b : 0x91a65b, side: THREE.DoubleSide });
      for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.8, 4), material);
        leaf.position.set(Math.sin(i * 1.25) * 0.2, 0.35, Math.cos(i * 1.25) * 0.2);
        leaf.rotation.z = (i - 2) * 0.28;
        group.add(leaf);
      }
      group.position.set(x, y, z);
      mesh = group;
    } else return;
    mesh.userData.resourceKind = kind;
    scene.add(mesh);
    resources.push({ mesh, kind, active: true });
  }

  const rand = (min, max) => min + Math.random() * (max - min);
  const kinds = ["stick", "stick", "stick", "stone", "stone", "flint", "fiber", "fiber", "herb", "fruit", "coconut"];
  for (let i = 0; i < 90; i++) {
    const x = rand(-worldSize * 0.44, worldSize * 0.44);
    const z = rand(-worldSize * 0.44, worldSize * 0.44);
    if (Math.hypot(x, z - 8) < 9) continue;
    spawnResource(kinds[Math.floor(Math.random() * kinds.length)], x, z);
  }

  function spawnWater(x, z) {
    const y = terrainHeight(x, z) + 0.04;
    const water = new THREE.Mesh(new THREE.CircleGeometry(2.6, 32), new THREE.MeshStandardMaterial({ color: 0x426f78, roughness: 0.25, metalness: 0.05, transparent: true, opacity: 0.8 }));
    water.rotation.x = -Math.PI / 2;
    water.position.set(x, y, z);
    scene.add(water);
    resources.push({ mesh: water, kind: "water", active: true });
  }
  spawnWater(-38, -26);
  spawnWater(54, 40);
  spawnWater(76, -62);

  function makeAnimal(type, x, z) {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: type === "jaguar" ? 0xc69b50 : type === "caiman" ? 0x53634a : type === "bird" ? 0x9b5941 : 0x806e50, roughness: 0.95 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(type === "jaguar" ? 0.75 : type === "snake" ? 0.25 : 0.48, 12, 9), bodyMat);
    body.scale.set(type === "caiman" || type === "snake" ? 1.8 : type === "frog" ? 0.85 : 1.35, type === "caiman" || type === "snake" ? 0.38 : 0.8, type === "bird" ? 0.8 : 1.15);
    body.position.y = type === "bird" ? 0.8 : 0.55;
    group.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(type === "jaguar" ? 0.34 : 0.22, 10, 8), bodyMat);
    head.position.set(0, type === "bird" ? 1 : 0.68, -0.58);
    group.add(head);
    if (type === "bird") {
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.32, 5), new THREE.MeshStandardMaterial({ color: 0xd6a34e }));
      beak.position.set(0, 0.98, -0.85);
      beak.rotation.x = -Math.PI / 2;
      group.add(beak);
    }
    group.position.set(x, terrainHeight(x, z), z);
    scene.add(group);
    animals.push({ type, mesh: group, hp: type === "jaguar" ? 70 : 35, speed: type === "jaguar" ? 1.7 : rand(0.5, 1.2), direction: rand(0, Math.PI * 2), timer: rand(2, 7), alive: true, attackCooldown: 0, aiState: "roaming", warningTimer: 0, warningCooldown: 0 });
  }
  for (let i = 0; i < 16; i++) {
    const x = rand(-worldSize * 0.4, worldSize * 0.4), z = rand(-worldSize * 0.4, worldSize * 0.4);
    const type = i < 3 ? "caiman" : i < 6 ? "bird" : i < 9 ? "armadillo" : i < 12 ? "frog" : "snake";
    makeAnimal(type, x, z);
  }

  function nearestTarget(maxDistance = 3.2) {
    const origin = camera.position;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).setY(0).normalize();
    let best = null, bestDistance = maxDistance;
    for (const resource of resources) {
      if (!resource.active) continue;
      const distance = origin.distanceTo(resource.mesh.position);
      if (distance > bestDistance) continue;
      const toward = resource.mesh.position.clone().sub(origin).setY(0).normalize();
      if (toward.dot(forward) < 0.12 && distance > 1.3) continue;
      best = resource;
      bestDistance = distance;
    }
    for (const tree of trees) {
      if (tree.harvested) continue;
      const distance = origin.distanceTo(new THREE.Vector3(tree.x, terrainHeight(tree.x, tree.z) + 1, tree.z));
      if (distance < bestDistance) { best = { kind: "tree", tree }; bestDistance = distance; }
    }
    for (const object of placedObjects) {
      if (!object.active) continue;
      const distance = origin.distanceTo(object.mesh.position);
      if (distance < bestDistance) { best = object; bestDistance = distance; }
    }
    return best;
  }

  function interact() {
    const target = nearestTarget();
    if (!target) { notify("Nothing close enough to interact with."); return; }
    if (target.kind === "tree") {
      if (count("axe") < 1) { notify("You need a crafted stone axe to chop this tree."); return; }
      target.tree.harvested = true;
      scene.remove(target.tree.group);
      const obstacleIndex = solidObstacles.indexOf(target.tree.obstacle);
      if (obstacleIndex >= 0) solidObstacles.splice(obstacleIndex, 1);
      addItem("log", 3);
      discover("Tree chopping", "A stone axe can harvest wood from large trees.");
      notify("Tree chopped. Collected 3 wood logs.");
    } else if (target.kind === "shelter") {
      openRest();
    } else if (target.kind === "water") {
      addItem("dirty_water", 1);
      discover("Freshwater pool", "A natural water source. Filter or boil water before drinking when possible.");
      notify("Collected unfiltered water. Be careful drinking it.");
    } else if (target.kind === "fire") {
      const raw = count("raw_meat");
      if (count("dirty_water") > 0) {
        state.inventory.dirty_water -= 1;
        addItem("clean_water", 1);
        notify("Boiled water is now safe to drink.");
      } else if (raw > 0) {
        state.inventory.raw_meat -= 1;
        addItem("cooked_meat", 1);
        notify("Cooked one piece of meat.");
      } else notify("The fire is warm. Bring raw meat or unfiltered water here.");
    } else if (target.kind === "shelter") {
      openRest();
    } else {
      addItem(target.kind, 1);
      target.active = false;
      scene.remove(target.mesh);
      discover(itemInfo[target.kind]?.[0] || target.kind, itemInfo[target.kind]?.[1] || "A useful wilderness resource.");
      notify("Collected " + (itemInfo[target.kind]?.[0] || target.kind) + ".");
    }
  }

  function nearestAnimal(maxDistance = 3.4) {
    let best = null, distance = maxDistance;
    for (const animal of animals) {
      if (!animal.alive) continue;
      const d = camera.position.distanceTo(animal.mesh.position);
      if (d < distance) { best = animal; distance = d; }
    }
    return best;
  }
  function attackAnimal() {
    const ranged = count("bow") > 0 && count("arrow") > 0;
    const animal = nearestAnimal(ranged ? 18 : 3.4);
    if (!animal) return;
    if (ranged) { state.inventory.arrow -= 1; animal.hp -= 25; }
    else if (count("spear") > 0) animal.hp -= 35;
    else { notify("You need a crafted spear, or a bow and arrow, to hunt."); return; }
    notify("You hit the " + animal.type + ".");
    if (animal.hp <= 0) {
      animal.alive = false;
      scene.remove(animal.mesh);
      addItem("raw_meat", animal.type === "bird" ? 1 : 2);
      addItem("hide", 1);
      if (animal.type === "bird") addItem("feather", 2);
      state.kills += 1;
      scentSources.push({ x: animal.mesh.position.x, z: animal.mesh.position.z, remainingHours: 72, intensity: 1 });
      discover("Wildlife: " + animal.type, "You encountered and hunted a " + animal.type + ".");
      notify("Animal harvested. Cook the meat before eating.");
    }
  }

  function placeBuild(kind) {
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).setY(0).normalize();
    const x = camera.position.x + forward.x * 3;
    const z = camera.position.z + forward.z * 3;
    const y = terrainHeight(x, z);
    if (kind === "campfire") {
      if (count("campfire") < 1) { notify("Craft a campfire kit first."); return; }
      state.inventory.campfire -= 1;
      const group = new THREE.Group();
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x77776b });
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25, 0), stoneMat);
        stone.position.set(Math.cos(a) * 0.75, 0.18, Math.sin(a) * 0.75);
        group.add(stone);
      }
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.1, 7), new THREE.MeshBasicMaterial({ color: 0xff9c38 }));
      flame.position.y = 0.68;
      group.add(flame);
      group.position.set(x, y, z);
      scene.add(group);
      const light = new THREE.PointLight(0xff9b45, 2.2, 12);
      light.position.set(x, y + 1.2, z);
      scene.add(light);
      placedObjects.push({ kind: "fire", mesh: group, light, active: true });
      state.fireCount += 1;
      notify("Campfire placed. Press E near it to cook meat.");
    } else {
      if (count("shelter") < 1) { notify("Craft a shelter kit first."); return; }
      state.inventory.shelter -= 1;
      const group = new THREE.Group();
      const wood = new THREE.MeshStandardMaterial({ color: 0x70563a, roughness: 1 });
      for (let i = 0; i < 4; i++) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 2.7, 6), wood);
        const a = i * Math.PI / 2;
        post.position.set(Math.cos(a) * 1.35, 1.3, Math.sin(a) * 1.35);
        post.rotation.z = Math.cos(a) * 0.12;
        group.add(post);
      }
      const roof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.7, 4), new THREE.MeshStandardMaterial({ color: 0x536b3c, side: THREE.DoubleSide }));
      roof.position.y = 3;
      roof.rotation.y = Math.PI / 4;
      group.add(roof);
      group.position.set(x, y, z);
      scene.add(group);
      placedObjects.push({ kind: "shelter", mesh: group, active: true });
      notify("Shelter built. Press E nearby to rest.");
    }
  }

  function toggleDebug() {
    if (debugRoot.childElementCount) { debugRoot.innerHTML = ""; return; }
    if (isLocked()) document.exitPointerLock();
    panelRoot.innerHTML = "";
    const panel = document.createElement("section");
    panel.className = "surv-debug";
    const title = document.createElement("h2");
    title.textContent = "WILDLANDS // DEVELOPER TEST PANEL";
    panel.appendChild(title);
    const info = document.createElement("div");
    info.className = "surv-sub";
    info.textContent = "F3 closes • Changes are temporary • Debug tools are local single-player tools";
    panel.appendChild(info);
    const columns = document.createElement("div");
    columns.className = "debug-columns";
    panel.appendChild(columns);
    function box(name) {
      const b = document.createElement("div"); b.className = "debug-box";
      const h = document.createElement("h3"); h.textContent = name; b.appendChild(h); columns.appendChild(b); return b;
    }
    function action(parent, label, fn) {
      const btn = document.createElement("button"); btn.className = "surv-btn secondary"; btn.textContent = label; btn.addEventListener("click", fn); parent.appendChild(btn); return btn;
    }
    function slider(parent, label, key, min, max) {
      const row = document.createElement("label"); row.className = "debug-row";
      const text = document.createElement("span"); text.textContent = label;
      const input = document.createElement("input"); input.type = "range"; input.min = min; input.max = max; input.value = state[key];
      const value = document.createElement("b"); value.textContent = Math.round(state[key]);
      input.addEventListener("input", () => { state[key] = Number(input.value); value.textContent = input.value; });
      row.append(text, input, value); parent.appendChild(row);
    }
    const stats = box("PLAYER VITALS");
    ["health","hunger","thirst","stamina","sanity"].forEach(key => slider(stats, key.toUpperCase(), key, 0, 100));
    const conditions = box("CONDITIONS");
    slider(conditions, "Infection", "infection", 0, 100);
    slider(conditions, "Parasites", "parasites", 0, 100);
    slider(conditions, "Wetness", "wetness", 0, 100);
    slider(conditions, "Time of day", "time", 0, 24);
    slider(conditions, "Day number", "day", 1, 365);
    const flags = box("GAME RULES");
    action(flags, state.godMode ? "GOD MODE: ON" : "GOD MODE: OFF", () => { state.godMode = !state.godMode; toggleDebug(); toggleDebug(); });
    action(flags, state.survivalEnabled ? "SURVIVAL: ON" : "SURVIVAL: OFF", () => { state.survivalEnabled = !state.survivalEnabled; toggleDebug(); toggleDebug(); });
    const diff = document.createElement("select");
    ["easy","normal","hard"].forEach(v => { const o = document.createElement("option"); o.value = v; o.textContent = v.toUpperCase(); diff.appendChild(o); });
    diff.value = state.difficulty;
    diff.addEventListener("change", () => state.difficulty = diff.value);
    const diffRow = document.createElement("div"); diffRow.className = "debug-row"; diffRow.append("Difficulty", diff); flags.appendChild(diffRow);
    const weather = document.createElement("select");
    ["clear","rain"].forEach(v => { const o = document.createElement("option"); o.value = v; o.textContent = v.toUpperCase(); weather.appendChild(o); });
    weather.value = state.weather;
    weather.addEventListener("change", () => { state.weather = weather.value; notify("Weather set to " + state.weather + "."); });
    const weatherRow = document.createElement("div"); weatherRow.className = "debug-row"; weatherRow.append("Weather", weather); flags.appendChild(weatherRow);
    const inventory = box("SPAWN ITEMS");
    const itemSelect = document.createElement("select");
    Object.keys(itemInfo).forEach(id => { const o = document.createElement("option"); o.value = id; o.textContent = itemInfo[id][0]; itemSelect.appendChild(o); });
    const amount = document.createElement("input"); amount.type = "number"; amount.min = "1"; amount.max = "99"; amount.value = "5";
    const spawnRow = document.createElement("div"); spawnRow.className = "debug-row"; spawnRow.append(itemSelect, amount); inventory.appendChild(spawnRow);
    action(inventory, "GIVE ITEM", () => { addItem(itemSelect.value, Math.max(1, Math.min(99, Number(amount.value) || 1))); notify("Debug: added " + itemInfo[itemSelect.value][0]); });
    action(inventory, "GIVE ALL MATERIALS", () => { ["stick","stone","flint","fiber","herb","fruit","coconut","rope","log","hide","feather"].forEach(id => addItem(id, 25)); notify("Debug materials added."); });
    const spawn = box("SPAWN & WORLD");
    action(spawn, "SPAWN JAGUAR", () => { makeAnimal("jaguar", camera.position.x + 8, camera.position.z - 8); });
    action(spawn, "SPAWN ARMADILLO", () => { makeAnimal("armadillo", camera.position.x + 5, camera.position.z - 5); });
    action(spawn, "SPAWN BIRD", () => { makeAnimal("bird", camera.position.x + 4, camera.position.z - 3); });
    action(spawn, "SPAWN CAIMAN", () => { makeAnimal("caiman", camera.position.x + 7, camera.position.z - 6); });
    action(spawn, "SPAWN FROG", () => { makeAnimal("frog", camera.position.x + 3, camera.position.z - 5); });
    action(spawn, "SPAWN SNAKE", () => { makeAnimal("snake", camera.position.x + 5, camera.position.z - 7); });
    action(spawn, "SPAWN WATER", () => spawnWater(camera.position.x + 7, camera.position.z + 7));
    action(spawn, "PLACE CAMPFIRE", () => { state.inventory.campfire = Math.max(1, count("campfire")); placeBuild("campfire"); });
    action(spawn, "PLACE SHELTER", () => { state.inventory.shelter = Math.max(1, count("shelter")); placeBuild("shelter"); });
    action(spawn, "TELEPORT TO START", () => { camera.position.set(0, terrainHeight(0, 8) + player.eyeHeight, 8); });
    action(spawn, "TELEPORT RANDOM", () => { const x = rand(-100,100), z = rand(-100,100); camera.position.set(x, terrainHeight(x,z) + player.eyeHeight, z); });
    action(spawn, "NEXT DAY", () => { state.day++; state.time = 8; });
    const testing = box("TEST EVENTS");
    action(testing, "ADD WOUND", () => { state.wounds.push({ age: 0 }); notify("Debug wound added."); });
    action(testing, "ADD INFECTION", () => { state.infection = Math.min(100, state.infection + 25); });
    action(testing, "ADD PARASITES", () => { state.parasites = Math.min(100, state.parasites + 25); });
    action(testing, "TEST AMOEBIC EXPOSURE", () => { exposeToAmoebicParasite(state.ecology, () => 0); notify("Debug: amoebic incubation started."); });
    action(testing, "TEST BOTFLY LIFECYCLE", () => { exposeToBotflyScent(state.ecology, 10, false); advanceEcology(state.ecology, 48); notify("Debug: body inspection should detect a treatable parasite."); });
    action(testing, "APPLY RESIN / COMPLETE TREATMENT", () => { if (applyResinToBotfly(state.ecology)) { advanceEcology(state.ecology, 2); completeBotflyExtraction(state.ecology); notify("The fictional parasite treatment is complete."); } else notify("No active condition is ready for this treatment."); });
    action(testing, "TEST INDUSTRIAL SMOKE", () => { emitIndustrialSmoke(state.ecology, 55); notify("Debug: regional smoke pollution increased."); });
    action(testing, "ADVANCE ECOLOGY 12 HOURS", () => { advanceEcology(state.ecology, 12); notify("Debug: ecology advanced by 12 game-hours."); });
    action(testing, "ADVANCE ECOLOGY 48 HOURS", () => { advanceEcology(state.ecology, 48); notify("Debug: ecology advanced by 48 game-hours."); });
    action(testing, "DAMAGE PLAYER (-25)", () => { damagePlayer(25, "Debug damage"); });
    action(testing, "TEST FALL DAMAGE", () => { applyFallDamage(22); });
    action(testing, "HEAL PLAYER", () => { state.health = 100; state.wounds = []; state.infection = 0; state.parasites = 0; });
    action(testing, "RESET SURVIVAL STATS", () => { state.health=100;state.hunger=100;state.thirst=100;state.stamina=100;state.sanity=100;state.infection=0;state.parasites=0;state.wounds=[]; });
    action(testing, "CLEAR INVENTORY", () => { state.inventory = {}; });
    action(testing, "RESET COUNTERS", () => { state.kills=0;state.gathered=0;state.crafted=0; });
    action(testing, "RESET WORLD / RELOAD", () => { window.location.reload(); });
    const readout = box("LIVE READOUT");
    const read = document.createElement("pre"); read.id = "debug-readout"; read.style.cssText = "white-space:pre-wrap;color:#cbd8bd;font-size:11px;line-height:1.5"; readout.appendChild(read);
    debugRoot.appendChild(panel);
  }

  function damagePlayer(amount, reason) {
    if (state.godMode) return;
    state.health = Math.max(0, state.health - amount);
    state.damageTaken += amount;
    state.wounds.push({ age: 0 });
    notify(reason || "You are injured.");
    if (state.health <= 0) notify("You are exhausted and need to recover. Debug menu can restore your health.");
  }

  function updateAnimals(delta) {
    jaguarSpawnCheckTimer -= delta;
    if (jaguarSpawnCheckTimer <= 0) {
      jaguarSpawnCheckTimer = 60;
      const isNight = state.time >= 19 || state.time <= 5;
      const existingJaguarCount = animals.filter(animal => animal.alive && animal.type === "jaguar").length;
      if (shouldSpawnJaguar({ isNight, existingJaguarCount })) {
        const angle = rand(0, Math.PI * 2);
        const radius = rand(25, 40);
        const x = THREE.MathUtils.clamp(camera.position.x + Math.sin(angle) * radius, -worldSize * 0.42, worldSize * 0.42);
        const z = THREE.MathUtils.clamp(camera.position.z + Math.cos(angle) * radius, -worldSize * 0.42, worldSize * 0.42);
        makeAnimal("jaguar", x, z);
        notify("A distant movement shifts through the trees.");
      }
    }
    for (const animal of animals) {
      if (!animal.alive) continue;
      animal.timer -= delta;
      animal.attackCooldown -= delta;
      const dx = camera.position.x - animal.mesh.position.x;
      const dz = camera.position.z - animal.mesh.position.z;
      const distance = Math.hypot(dx, dz);

      if (animal.type === "jaguar") {
        let fireDistance = Infinity;
        for (const object of placedObjects) {
          if (!object.active || object.kind !== "fire") continue;
          fireDistance = Math.min(fireDistance, Math.hypot(
            animal.mesh.position.x - object.mesh.position.x,
            animal.mesh.position.z - object.mesh.position.z
          ));
        }
        const playerSprinting = Math.hypot(player.velocity.x, player.velocity.z) > 5.5;
        const previousState = animal.aiState;
        const nextState = advanceJaguarState(animal, { distance, fireDistance, playerSprinting }, delta);
        if (nextState === "warning" && previousState !== "warning") {
          notify("A heavy movement in the brush. Something is tracking you.");
        }
        if (nextState === "retreating") {
          animal.direction = Math.atan2(-dx, -dz);
        } else if (nextState === "stalking") {
          const forwardX = -Math.sin(player.yaw);
          const forwardZ = -Math.cos(player.yaw);
          const targetX = camera.position.x - forwardX * 6;
          const targetZ = camera.position.z - forwardZ * 6;
          animal.direction = Math.atan2(targetX - animal.mesh.position.x, targetZ - animal.mesh.position.z);
        } else if (nextState === "warning" || nextState === "pouncing") {
          animal.direction = Math.atan2(dx, dz);
        } else if (animal.timer <= 0) {
          animal.timer = rand(2, 7);
          animal.direction += rand(-1.7, 1.7);
        }
        if (nextState === "pouncing" && distance < 1.8 && animal.attackCooldown <= 0) {
          animal.attackCooldown = 4;
          damagePlayer(8, "The jaguar catches you in a sudden encounter. Break away and find cover.");
          animal.aiState = "retreating";
        }
        const speed = nextState === "retreating" ? 4.2 : nextState === "pouncing" ? 5.0 : nextState === "stalking" ? 1.25 : nextState === "warning" ? 0.15 : animal.speed * 0.45;
        const nx = animal.mesh.position.x + Math.sin(animal.direction) * speed * delta;
        const nz = animal.mesh.position.z + Math.cos(animal.direction) * speed * delta;
        if (Math.abs(nx) < worldSize * 0.47 && Math.abs(nz) < worldSize * 0.47) {
          animal.mesh.position.x = nx;
          animal.mesh.position.z = nz;
          animal.mesh.position.y = terrainHeight(nx, nz);
        }
        animal.mesh.rotation.y = animal.direction + Math.PI;
        continue;
      }

      if ((animal.type === "caiman" && distance < 2.0) || (animal.type === "snake" && distance < 1.5)) {
        animal.direction = Math.atan2(dx, dz);
        const attackRange = animal.type === "caiman" ? 1.8 : 1.35;
        if (distance < attackRange && animal.attackCooldown <= 0) {
          animal.attackCooldown = 3.5;
          damagePlayer(animal.type === "caiman" ? 7 : 4, "A " + animal.type + " startled you. Move away.");
        }
      } else if (distance < 7 && animal.type !== "caiman") {
        animal.direction = Math.atan2(-dx, -dz);
      } else if (animal.timer <= 0) {
        animal.timer = rand(2, 7);
        animal.direction += rand(-1.7, 1.7);
      }
      const speed = animal.speed * (distance < 7 ? 1.4 : 0.45);
      const nx = animal.mesh.position.x + Math.sin(animal.direction) * speed * delta;
      const nz = animal.mesh.position.z + Math.cos(animal.direction) * speed * delta;
      if (Math.abs(nx) < worldSize * 0.47 && Math.abs(nz) < worldSize * 0.47) {
        animal.mesh.position.x = nx;
        animal.mesh.position.z = nz;
        animal.mesh.position.y = terrainHeight(nx, nz);
      }
      animal.mesh.rotation.y = animal.direction + Math.PI;
    }
  }

  function updateRain(delta) {
    rain.visible = state.weather === "rain";
    if (!rain.visible) return;
    const positions = rain.geometry.attributes.position.array;
    for (let i = 0; i < rainCount; i++) {
      const offset = i * 3;
      positions[offset + 1] -= delta * 19;
      if (positions[offset + 1] < camera.position.y - 3 || Math.abs(positions[offset] - camera.position.x) > 24 || Math.abs(positions[offset + 2] - camera.position.z) > 24) {
        positions[offset] = camera.position.x + rand(-22, 22);
        positions[offset + 1] = camera.position.y + rand(5, 25);
        positions[offset + 2] = camera.position.z + rand(-22, 22);
      }
    }
    rain.geometry.attributes.position.needsUpdate = true;
  }

  function updateSurvival(delta) {
    state.time += delta * 0.025;
    if (state.survivalEnabled) {
      const gameHoursDelta = delta * 0.025;
      const gameMinutesDelta = gameHoursDelta * 60;
      for (let i = scentSources.length - 1; i >= 0; i--) {
        const source = scentSources[i];
        source.remainingHours -= gameHoursDelta;
        if (source.remainingHours <= 0) scentSources.splice(i, 1);
      }
      const nearCarcass = scentSources.some(source => Math.hypot(camera.position.x - source.x, camera.position.z - source.z) < 7);
      const shelteredBySmoke = placedObjects.some(object => object.active && object.kind === "fire" &&
        Math.hypot(camera.position.x - object.mesh.position.x, camera.position.z - object.mesh.position.z) < 12);
      const previousBotflyPhase = state.ecology.botfly.phase;
      exposeToBotflyScent(state.ecology, nearCarcass ? gameMinutesDelta : 0, shelteredBySmoke);
      if (previousBotflyPhase === "clear" && state.ecology.botfly.phase === "developing") {
        notify("Persistent exposure near an unprotected carcass. Check your body after resting.");
      }
      const previousAmoebicPhase = state.ecology.amoebic.phase;
      advanceEcology(state.ecology, delta * 0.025);
      if (previousAmoebicPhase === "incubating" && state.ecology.amoebic.phase === "active") {
        notify("Your stomach cramps. Your smartwatch reports ERR: BIO-LEAK.");
      }
    }
    if (state.time >= 24) { state.time -= 24; state.day += 1; }
    if (state.weather === "rain") state.wetness = Math.min(100, state.wetness + delta * 2.5);
    else state.wetness = Math.max(0, state.wetness - delta * 0.5);
    state.temperature = state.weather === "rain" ? 23 : 28;
    const sun = scene.children.find(child => child.isDirectionalLight);
    const hemi = scene.children.find(child => child.isHemisphereLight);
    const daylight = Math.max(0, Math.sin(((state.time - 6) / 12) * Math.PI));
    if (sun) { sun.intensity = 0.12 + daylight * 2.0; sun.position.set(-65 + Math.cos(state.time * Math.PI / 12) * 35, 20 + daylight * 90, 35); }
    if (hemi) hemi.intensity = 0.35 + daylight * 1.2;
    if (!state.survivalEnabled) return;
    const difficulty = state.difficulty === "easy" ? 0.65 : state.difficulty === "hard" ? 1.55 : 1;
    state.hunger = Math.max(0, state.hunger - delta * 0.075 * difficulty);
    state.thirst = Math.max(0, state.thirst - delta * 0.12 * difficulty);
    if (state.hunger <= 0) {
      state.hungerDamageTimer += delta;
      if (state.hungerDamageTimer > 5) { state.hungerDamageTimer = 0; if (!state.godMode) state.health = Math.max(0, state.health - 1); }
    } else state.hungerDamageTimer = 0;
    if (state.thirst <= 0) {
      state.thirstDamageTimer += delta;
      if (state.thirstDamageTimer > 3) { state.thirstDamageTimer = 0; if (!state.godMode) state.health = Math.max(0, state.health - 1.5); }
    } else state.thirstDamageTimer = 0;
    if (state.stamina < 100) state.stamina = Math.min(100, state.stamina + delta * 4.5);
    if (state.infection > 0) {
      state.infectionTimer += delta;
      if (state.infectionTimer > 5) { state.infectionTimer = 0; if (!state.godMode) state.health = Math.max(0, state.health - state.infection * 0.002); }
    }
    if (state.parasites > 0) {
      state.hunger = Math.max(0, state.hunger - delta * 0.025 * (state.parasites / 20));
    }
    for (const wound of state.wounds) {
      wound.age += delta;
      if (wound.age > 90) state.infection = Math.min(100, state.infection + delta * 0.025);
    }
    state.sanity = Math.max(0, state.sanity - (state.time > 20 || state.time < 5 ? delta * 0.035 : 0));
  }

  function renderHud() {
    const active = isLocked();
    topHud.style.display = active ? "block" : "none";
    hint.style.display = active ? "block" : "none";
    bottom.style.display = active ? "block" : "none";
    const bars = ["health","hunger","thirst","stamina","sanity"];
    const labels = { health:"HEALTH", hunger:"HUNGER", thirst:"THIRST", stamina:"STAMINA", sanity:"SANITY" };
    const colors = { health:"#bd7468", hunger:"#c7a66b", thirst:"#76a9bb", stamina:"#a9c48c", sanity:"#9b91bd" };
    const barRoot = document.getElementById("surv-bars");
    if (barRoot) barRoot.innerHTML = bars.map(key => '<div class="surv-stat"><span>' + labels[key] + '</span><div class="surv-track"><div class="surv-fill" style="width:' + state[key] + '%;background:' + colors[key] + '"></div></div><b>' + Math.round(state[key]) + '</b></div>').join("");
    const cond = document.getElementById("surv-conditions");
    if (cond) {
      const tags = [];
      if (state.weather === "rain") tags.push("RAIN");
      if (state.wounds.length) tags.push("WOUNDS " + state.wounds.length);
      if (state.infection > 5) tags.push("INFECTION");
      if (state.parasites > 5 || state.ecology.amoebic.phase === "active") tags.push("PARASITES");
      if (state.ecology.botfly.phase !== "clear") tags.push("BODY CHECK");
      if (state.ecology.sefIlunStance === "hostile") tags.push("CANOPY HOSTILE");
      cond.textContent = tags.join(" • ");
    }
    bottom.textContent = "DAY " + state.day + "  •  " + String(Math.floor(state.time)).padStart(2,"0") + ":" + String(Math.floor((state.time % 1) * 60)).padStart(2,"0") + "  •  " + count("spear") + " SPEAR";
    if (toast.style.opacity === "1") {
      state.messageTime -= 1 / 60;
      if (state.messageTime <= 0) toast.style.opacity = "0";
    }
    const target = nearestTarget();
    hint.textContent = target ? (target.kind === "water" ? "E  COLLECT WATER" : target.kind === "fire" ? "E  COOK MEAT / BOIL WATER" : target.kind === "shelter" ? "E  REST" : target.kind === "tree" ? "E  CHOP TREE (STONE AXE)" : "E  GATHER " + target.kind.toUpperCase()) : (count("spear") ? "LEFT CLICK  HUNT  •  I INVENTORY  •  C CRAFT  •  J JOURNAL  •  F3 DEBUG" : "I INVENTORY  •  C CRAFT  •  J JOURNAL  •  F3 DEBUG");
    const read = document.getElementById("debug-readout");
    if (read) read.textContent = [
      "Position: " + camera.position.x.toFixed(1) + ", " + camera.position.y.toFixed(1) + ", " + camera.position.z.toFixed(1),
      "Day/time: " + state.day + " / " + state.time.toFixed(2),
      "Animals alive: " + animals.filter(a => a.alive).length,
      "Resources active: " + resources.filter(r => r.active).length,
      "Inventory types: " + Object.keys(state.inventory).filter(k => count(k)>0).length,
      "Wounds: " + state.wounds.length + " | Infection: " + state.infection.toFixed(1) + " | Parasites: " + state.parasites.toFixed(1),
      "Amoebic: " + state.ecology.amoebic.phase + " (" + state.ecology.amoebic.incubationHoursRemaining.toFixed(1) + "h) | Botfly: " + state.ecology.botfly.phase,
      "Carcass scent sources: " + scentSources.length,
      "Air pollution: " + state.ecology.airPollutionLoad.toFixed(1) + " | Above threshold: " + state.ecology.hoursAbovePollutionThreshold.toFixed(1) + "h | Sef-Ilun: " + state.ecology.sefIlunStance,
      "Animals harvested: " + state.kills + " | Gather actions: " + state.gathered + " | Crafts: " + state.crafted,
      "Difficulty: " + state.difficulty + " | Survival: " + state.survivalEnabled + " | God mode: " + state.godMode,
      "Weather: " + state.weather + " | Temperature: " + state.temperature + " C | Wetness: " + state.wetness.toFixed(1) + "%",
      "FPS: " + state.fps.toFixed(0) + " | Draw calls: " + (renderer ? renderer.info.render.calls : 0) + " | Triangles: " + (renderer ? renderer.info.render.triangles : 0)
    ].join("\\n");
  }

  function keydown(event) {
    if (event.code === "F3") {
      event.preventDefault();
      if (debugRoot.childElementCount) debugRoot.innerHTML = ""; else toggleDebug();
      return;
    }
    if (event.code === "Escape" && state.activePanel) { closePanel(); return; }
    if (event.repeat) return;
    if (event.code === "KeyE" && isLocked()) interact();
    if ((event.code === "KeyI" || event.code === "Tab") && isLocked()) { event.preventDefault(); if (state.activePanel === "INVENTORY") closePanel(); else openInventory(); }
    if (event.code === "KeyC" && isLocked()) { if (state.activePanel === "CRAFTING") closePanel(); else openCrafting(); }
    if (event.code === "KeyJ" && isLocked()) { if (state.activePanel === "FIELD JOURNAL") closePanel(); else openJournal(); }
    if (event.code === "KeyB" && isLocked()) {
      if (state.buildMode) { state.buildMode = ""; notify("Build mode cancelled."); }
      else { state.buildMode = "campfire"; notify("Build mode: press 1 for campfire, 2 for shelter."); }
    }
    if (event.code === "Digit1" && state.buildMode) { placeBuild("campfire"); state.buildMode = ""; }
    if (event.code === "Digit2" && state.buildMode) { placeBuild("shelter"); state.buildMode = ""; }
  }
  function click(event) {
    if (!isLocked() || event.button !== 0 || state.activePanel || debugRoot.childElementCount) return;
    attackAnimal();
  }
  document.addEventListener("keydown", keydown);
  document.addEventListener("mousedown", click);

  function applyFallDamage(impactSpeed) {
    const damage = Math.min(45, Math.max(0, (impactSpeed - 12) * 3.2));
    if (damage > 0) damagePlayer(damage, "Hard landing! You injured yourself.");
  }

  function update(delta, frameDelta = delta) {
    state.fps = frameDelta > 0 ? 1 / frameDelta : 0;
    updateSurvival(delta);
    updateRain(delta);
    updateAnimals(delta);
    renderHud();
  }
  function canSprint() { return !state.survivalEnabled || state.stamina > 1; }
  function sprintMultiplier() { return state.survivalEnabled ? (state.stamina > 0 ? 1 : player.speed / player.sprintSpeed) : 1; }
  function consumeSprint(delta, sprinting) {
    if (!state.survivalEnabled || !sprinting) return;
    state.stamina = Math.max(0, state.stamina - delta * 16);
  }
  function dispose() {
    document.removeEventListener("keydown", keydown);
    document.removeEventListener("mousedown", click);
    document.removeEventListener("pointerlockchange", syncHudVisibility);
    scene.remove(rain);
    rain.geometry.dispose();
    rain.material.dispose();
    ui.remove();
    style.remove();
  }

  return { update, canSprint, sprintMultiplier, consumeSprint, applyFallDamage, dispose, state };
}
