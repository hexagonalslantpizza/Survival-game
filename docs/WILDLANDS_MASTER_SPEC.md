# WILDLANDS — Official Master Design & Engineering Specification

**Status:** Official design canon  
**Runtime:** Browser-based 3D game using Three.js, Vite, and JavaScript  
**Primary target:** Desktop PC, first-person  
**Long-term targets:** Persistent multiplayer, cooperative play, and optional PvP

This document consolidates the approved world, systems, factions, interfaces, progression, atmosphere, and engineering direction. It describes intended design, not a claim that every feature is already implemented.

## 1. Vision and design pillars

WILDLANDS is an ultra-realistic first-person rainforest survival simulation set in a vast, hostile, fictional Neotropical rainforest. It aims for oppressive atmosphere, systemic depth, and demanding survival decisions while maintaining its own original world, fiction, mechanics, and identity.

The game rejects conventional open-world conveniences:
- No satellite minimap, glowing waypoints, automatic player marker, cleanly revealing fog-of-war, or persistent arcade-style survival bars.
- Navigation is learned through landmarks, natural clues, physical maps, a compass, and field notes.
- Inventory, crafting, construction, navigation, and diagnostics are physical or diegetic interactions.
- The rainforest is an active ecosystem. Player actions can change wildlife, terrain, faction behavior, resource availability, and regional conditions.
- Systems interact through understandable cause and effect rather than disconnected meters.
- Dangerous encounters are rare enough to remain memorable. The rainforest must sometimes feel quiet while remaining alive.
- Visual target: grounded, photorealistic, dense, tactile, and atmospheric—not Roblox-like, arcade-like, or dominated by generic UI.
- Development is staged and tested. Do not add unrequested gameplay features or silently discard approved design.

## 2. World scale, geography, and vertical ecology

### 2.1 World dimensions

The intended world is one contiguous 6 km × 6 km area (36 km²), divided into a 60 × 60 grid of 100 m × 100 m regional cells. Each horizontal cell can track state for four ecological elevation layers.

The layers are not disconnected levels. They are physically interconnected through trees, climbing paths, sinkholes, cave entrances, bridges, cliffs, and underground passages.

### 2.2 Four vertical layers

| Layer | Elevation | Identity |
|---|---:|---|
| 3 — High Canopy / Sky Highway | 30–50 m, with exceptional trees higher | Sunlight, wind, canopy wildlife, Sef-Ilun platforms and suspension paths |
| 2 — Mid-story / Green Wall | 5–29 m | Trunks, vines, epiphytes, fruit, nests, climbing routes, arboreal predators |
| 1 — Forest Floor / The Floor | 0–4 m | Leaf litter, buttress roots, rivers, mud, swamps, ground flora and fauna, Bahari-Vatu waterways |
| 0 — Under-Root | -1 to -50 m | Limestone caverns, underground rivers, echo chambers, flooded passages, Oru-Keth mining areas |

Trees and vines connect the floor, mid-story, and selected canopy routes. Sinkholes and cliff openings connect the surface to caverns. Underground waterways connect selected cave systems. Some cave entrances emerge at different elevations and distances.

The high canopy is exposed to stronger sunlight and wind. The forest floor is often dim beneath the canopy. The understory is dense and difficult to see through. Caves have distinct humidity, temperature, water, light, and acoustic behavior.

### 2.3 Three horizontal macro-sectors

**Sector Alpha — The Sinking Swamps (northwest):**
- Delta-like waterways, slow channels, deep mud, swamp pockets, floating vegetation, and persistent morning fog.
- Dominant faction: Bahari-Vatu.
- Key landmark: **The Sunken Vessel**, a rusting 1970s iron dredging barge lodged in a deep swamp channel. It contains valuable fictional salvage and mechanical components; caimans and Bahari-Vatu scouts make the area dangerous.

**Sector Beta — The Iron Ridge (northeast):**
- Limestone gorges, karst cliffs, dry ravines, steep ridges, sinkholes, and cave networks.
- Surface water is scarce; water sources require exploration.
- Dominant faction: Oru-Keth.
- Key landmark: **The Great Maw**, a roughly 40 m sinkhole with vine-covered walls and Oru-Keth-built scaffold routes descending into major cave and ore regions.

**Sector Gamma — The Whispering Old-Growth (south):**
- Ancient giant trees, trunks up to approximately 5 m in diameter, enormous buttress roots, deep shade, and cathedral-like forest floor spaces.
- Dominant faction: Sef-Ilun.
- Key landmark: **The Pillar of Heaven**, an exceptional kapok tree rising to approximately 60 m. Its root system forms a maze, while a multi-tier Sef-Ilun settlement spans ground, mid-story, and canopy levels. The tree is an intentional exception to the ordinary canopy height range.

Sector boundaries are not clean walls. Faction influence overlaps and shifts around resources, waterways, cave entrances, settlements, and travel corridors.

### 2.4 Environmental navigation

All rivers generally flow from higher elevations in the northeast Iron Ridge toward lower southwest swamp regions. Current direction is a natural navigation clue. A floating stick can reveal current direction in-game.

Players triangulate using:
- Large silhouettes such as the Pillar of Heaven.
- Ridge and cliff profiles.
- River direction and junctions.
- Smoke columns from distant industrial activity.
- Sun direction, wind, vegetation, and other natural cues.
- Faction trails, signs, bridges, settlements, and abandoned structures.

The player carries a physical topographical journal/map and brass lens compass. The map shows only information the player has learned. It does not automatically reveal the player's location or update when faction borders change. Players manually record landmarks, routes, estimated coordinates, cave discoveries, and shifting faction boundaries.

Getting lost is a meaningful survival hazard, but navigation must remain learnable and fair rather than arbitrary.

## 3. Atmosphere, weather, and terrain response

The rainforest includes a dense canopy, shifting shadows, rare shafts of sunlight, layered undergrowth, vines, ferns, buttress roots, mud, swamps, rivers, waterfalls, caves, cliffs, ridges, and clearings.

Weather and time influence light, visibility, temperature, humidity, wind, ambient audio, hydration, wetness, mud depth, slope traction, river levels, wildlife, faction patrols, fire behavior, smoke visibility, and camp exposure.

### 3.1 Weather phases

**Scorching humidity:** Hot, humid conditions; river levels recede; some clay beds and rocky paths are exposed; hydration demand increases.

**Monsoon surge:** Dense rain and dark storm clouds; wetness and mud accumulate; low-frequency sounds may be masked; paths become slippery; rivers rise; fires need shelter and maintenance.

**Flash-flood disruption:** Low ravines and dry creek beds can become dangerous torrents. Routes may be cut off. Players may need higher ridges or canopy routes. Floodwater can move loose objects and logs.

After floods, selected regions may retain persistent changes: displaced logs, new sandbanks, altered mud, covered deposits, and changed access routes. These changes should be regionally simulated and performance-conscious, not implemented by regenerating the entire world.

Weather is a macro-director of world state, not a visual overlay. Faction and wildlife behavior adapt to weather. During heavy monsoons, Bahari-Vatu may pull canoes ashore and shelter, Oru-Keth may concentrate in protected caves, and Sef-Ilun may alter canopy travel during high winds. Post-storm wildlife activity may increase near rivers.

Avoid making every storm or flood automatically lethal. Provide warning signs, alternative routes, and counterplay.

## 4. Sound and acoustic simulation

Sound is a gameplay information system. AI receives imperfect estimates—direction, approximate distance, intensity, duration, and category—not omniscient exact player coordinates.

Propagation considers distance, source intensity, frequency, duration, foliage density, trunks, rock walls, open river corridors, water noise, caves, echo zones, rain, wind, and ambient masking.

Initial conceptual examples:
- Quiet movement through wet foliage is relatively muffled.
- Dry twig snaps are noticeable nearby.
- Stone tool use is louder.
- Heavy metal tool use and tree felling have a much larger acoustic footprint.
- Campfires produce persistent crackling.
- Heavy rain can mask quieter sounds; thunder can briefly mask louder events.
- Caves add reflections and reverberation.
- Striking hardwood with a heavy tool may create low-frequency vibration detectable by canopy watchers.

Use practical approximations—acoustic zones, ray/shape queries, frequency-dependent attenuation, and cached or event-based calculations—not expensive full ray tracing for every sound on every frame.

### 4.1 Faction communication

The factions have distinct fictional communication systems. Communication is cultural and tactical, not generic enemy voice barks.

**Bahari-Vatu — Vatu-Tla:** liquid, sharp clicks, pops, and glottal stops suited to communication around rushing water. Short paired clicks confirm sightlines. A fast “Tlk-Tlk-Tla!” signals fresh tracks or warns nearby river patrols. Example phrase: “Tlk-Vatu, n’klo tla?” — “River family, do you observe this surface scar?”

**Oru-Keth — Keth-Ruh:** deep, resonant chest sounds, rolled R sounds, and sustained vowels. A booming “Vurr-Keth!” communicates an aggressive alert and has a distinctive low-frequency audio signature. Example: “Vurr-Keth! Oru-Maw!” — a territorial warning associated with the deep root.

**Sef-Ilun — Ilun-Sef:** non-verbal whistles with changing pitch, rising modulation, and sharp falling notes that resemble canopy bird calls. Paired calls communicate surveillance and coordinated movement. Example patterns include “Frequency Pattern 8A” and “Pattern 3C”; these are authored fictional signal labels.

The player initially does not understand these signals. Observation, journal discoveries, and context gradually reveal possible meanings. Audio cues must remain distinguishable from wildlife without making faction positions trivially obvious.

## 5. Factions, society, territory, and geopolitics

All three factions are entirely fictional. They are not direct stand-ins for real Indigenous peoples or cultures. Each has its own language, visual identity, architecture, history, traditions, resource economy, social organization, motivations, and territorial memory. They are intelligent social groups, not generic monsters.

### 5.1 Bahari-Vatu — The River Swarm

- Territory: rivers, wetlands, stilt villages, rope bridges, canoes, fishing grounds, and waterways.
- Visual identity: woven reed armor, caiman-hide-inspired motifs, muddy charcoal paint, and yellow river-silt lines.
- Culture/economy: fishing networks, river transport, nesting grounds, and water rights.
- Behavior: defensive of fishing lines, traps, and nesting areas; canoe patrols and water-based scouting.
- React to upstream contamination, overfishing, clay washing, industrial runoff, and theft from marked traps.
- During monsoons, canoes may be hauled to high ground and settlements become more defensive.

**Reed signs:** spiral knots tied into living river reeds mark fishing boundaries and water rights. Patterns communicate ownership, warnings, or boundary status. Taking resources from protected traps can sharply damage relations and provoke a response.

### 5.2 Oru-Keth — The Deep Root

- Territory: old-growth interior, caves, rocky ridges, mineral deposits, and major roots.
- Visual identity: layered ironbark wood and bone-like plates bound with vines, tapir-inspired masks, and ash-white clay markings.
- Culture/economy: mineral extraction, cave resources, timber, and defense of valuable territory.
- Behavior: strongly territorial, with land patrols, scouts, and heavily equipped defenders.
- React strongly to deforestation, mining, and unauthorized entry into guarded cave regions.
- Mind Root is a fictional botanical discovery associated with shaded Oru-Keth territory.
- Totems can influence localized spawn/activity systems. Destroying them can reduce one local pressure while increasing faction attention or raids elsewhere.

**Ash glyphs:** diamond-shaped bark markings filled with white charcoal ash identify cave routes, mineral boundaries, warnings, and territorial claims. Their meanings can be learned through observation.

### 5.3 Sef-Ilun — The Canopy Walkers

- Territory: high and mid canopy, giant trees, platforms, suspension bridges, and vine elevators.
- Visual identity: leaf, moss, and fern cloaks, plant pigments, and strong camouflage.
- Culture/economy: canopy travel, observation, rare fruits, birds, and forest stewardship.
- Behavior: elusive and observant. They may shadow a player for days, assess behavior, and respond when provoked or when the player's footprint becomes threatening.
- React to heavy noise, smoke, air pollution, logging vibration, and canopy destruction.
- Settlements and patrol routes make canopy travel a distinct world layer.

**Hanging markers:** small triangular woven frames with bone and green feather motifs identify active canopy routes, hunting zones, and warnings. Camp smoke entering a protected canopy zone can provoke a response. The exact response depends on relationship and context, not a universal instant attack.

### 5.4 Dynamic geopolitics

Each faction tracks population and roles, resources and supply, territory and influence, settlements and patrol routes, goals, relationships with other factions, relationship and memory of the player, and known threats and discoveries.

Factions can compete, trade, raid, negotiate, migrate, and fight each other even when the player is elsewhere. Borders shift in response to resources, population, conflict, and environmental conditions. The player may observe or influence conflicts, but should not be able to exploit every outcome deterministically.

AI tracks evidence such as sound events, scent, smoke, footprints, broken vegetation, and resource depletion. Scouts investigate, remember discoveries, and communicate them to settlements. Factions do not know what they have not discovered.

### 5.5 Environmental footprint

Large-scale logging, wildlife depletion, mining, smelting smoke, waste, and repeated loud activity increase a regional ecological footprint. Factions and wildlife respond to what they can plausibly observe. A camp becomes known gradually through smoke, sound, scent, and trails—not instantly because it exists.

## 6. Player physiology and survival

### 6.1 Four macro-nutrients

Track four bounded values, conceptually 0–100:
- **Protein:** cellular repair and muscle maintenance; prolonged deficiency reduces physical capability.
- **Carbohydrates:** readily available energy; exertion consumes them and deficiency slows stamina recovery.
- **Fat:** long-term energy, temperature regulation, and immune support.
- **Hydration:** changes quickly with heat, humidity, exertion, and illness.

Foods have individual fictional gameplay profiles rather than generic hunger points. Examples: roast bird is protein-rich; fruit is carbohydrate-rich; Brazil nuts are fat-rich; fatty game meat contributes protein and fat. These are game-balance values, not dietary advice.

Dietary conditioning can reduce the character's aversion to fallback foods over time, but does not improve nutrient content. Unsuitable food can cause fictional digestive problems and dehydration.

### 6.2 Biometric decay model

The initial design formula is:

deltaValue = -(baseDecayRate × deltaTime) × (1 + exertionMultiplier × weightTierFactor)

Exertion states include ordinary movement, sprinting, heavy tool use, and climbing. Hydration, carbohydrate, protein, and fat may use different decay coefficients and modifiers. Values are clamped to their valid range.

The proposed coefficients are initial tuning targets only. They must be calibrated against the game's time scale and playtesting. Use a fixed or controlled simulation timestep and centralized game clock.

### 6.3 Deficiency states and recovery

- Severe dehydration: dry mouth, blurred peripheral vision, altered audio perception, and eventually health loss.
- Severe carbohydrate deficiency: reduced stamina capacity and involuntary exertion sounds.
- Severe protein deficiency: reduced physical performance and subtle hand instability.
- Severe fat deficiency: reduced immune resilience and increased vulnerability to cold/wet stress.

Avoid permanent, unrecoverable debuffs. Severe states should be dangerous but recoverable. Do not use camera effects that cause excessive motion or make the game inaccessible.

### 6.4 Stamina and exertion

Stamina is a hidden or diegetic system, not a giant persistent yellow bar. High energy gives fluid movement and quiet breathing. Low energy creates ragged breathing, slower tool swings, subtle camera/body sway, and reduced sprint ability. Severe exhaustion can prevent sprinting and may cause context-sensitive collapse, but should not force a repetitive face-plant every time stamina reaches zero.

### 6.5 Hydration, temperature, and injury

Hydration depletion depends on heat, humidity, exertion, and illness. Cold and wet conditions interact with fatigue, immunity, and sanity. The character communicates condition through swallowing, coughing, heartbeat, breathing, visual clarity, and movement rather than a wall of UI.

Manual limb-by-limb body inspection lets the player examine arms and legs. Injuries include lacerations, sprains, bites, and other non-graphically presented conditions. Wounds can worsen or become infected if neglected. Leeches and ticks may attach after swamp or wet foliage exposure and need removal. Treatments are fictional gameplay systems, not real medical guidance.

### 6.6 Immunity and adaptation

A hidden Microbial Immunity Index develops through exposure. Adaptation is pathogen-specific; exposure to one fictional pathogen does not grant universal immunity. Repeated exposure may reduce severity or recovery time. Fat deficiency and poor health can reduce resilience. Severe illness remains dangerous, but recovery should be possible.

### 6.7 Sanity and psychological states

Sanity is affected by physical trauma, unpleasant or spoiled food, sleeping on bare ground, parasites, infections, darkness, isolation, storms, and faction territory pressure. Recovery comes from restful shelter, safe sleep, firelight, comfort food, treatment, and companionship.

Four intended phases:
- **Stable (100–75):** ordinary perception.
- **Paranoia (74–45):** false branch snaps, subtle whispers, peripheral shadow impressions, mild visual distortion.
- **Delusions (44–15):** occasional phantom sounds or visual impressions and smartwatch glitches. Hallucinations must not unfairly consume tool durability or make genuine threats impossible to distinguish.
- **Severe breakdown (14–0):** stronger audio/visual distortion, unreliable compass interpretation, panic, and impaired actions. Effects remain non-graphic and preserve accessibility.

Hallucinations need subtle, learnable tells so careful players can distinguish real threats. They should not make AI omniscient or arbitrarily punish the player.

## 7. Diegetic interfaces and physical equipment

### 7.1 Smartwatch

The character physically raises a scratched, glowing OLED tactical smartwatch. The game continues while it is inspected. It shows a circular four-part nutrient display—Hydration (blue), Carbohydrates (green), Protein (red), Fat (orange)—plus diagnostics such as temperature, fever, toxicity/venom, parasites, infection, battery, and sensor reliability.

The watch is not omniscient. It reports only what its sensors can detect. Fever, psychological deterioration, and low battery may cause flicker, blurred digits, static, or temporary outages. The tutorial begins with a nearly depleted battery.

### 7.2 Backpack and physical inventory

The inventory is a physical canvas and vine-woven backpack. The character removes it and lays it open; the game does not pause. Items occupy spatial compartments rather than generic stack counts alone.

- Long slots hold logs, spears, and long tools.
- Small grids and pouches hold small items.
- Heavy items are packed low.
- Items have dimensions, mass, orientation, and compartment rules.
- Items cannot overlap or clip. The pack cannot close if contents physically intersect.
- Small loose objects can spill from an open or damaged pouch during sprinting or a tumble and may be consumed by wildlife.

Weight and volume are separate limits: bulky light items occupy space; compact dense items consume weight capacity.

### 7.3 Kinetic weight tiers

Initial targets:
- **Agile: 0–15 kg.** Responsive movement and relatively quiet footsteps.
- **Encumbered: 16–35 kg.** Heavier footsteps, slower turns, camera/body inertia, wider steps, and increased slipping risk on mud.
- **Overloaded: 36 kg+.** Sprint disabled, strongly reduced stamina capacity, deeper sinking in soft terrain, and greater risk of strain or sprain.

Exact thresholds and consequences are tunable. Injuries should be contextual and fair, not random punishment for carrying a reasonable load.

### 7.4 Physical notebook

The leather-bound notebook is physically brought into view. The camera may shift focus toward the pages while retaining real-time movement and orientation. Handwritten tabs categorize Shelter, Tools, Medicine, Metallurgy, and other discoveries.

Left page: structural blueprints and placement preview.  
Right page: resource requirements and construction progress, represented by hand-drawn tally marks.

Blueprint placement uses a world ray and temporary 3D preview:
- Valid terrain and clear placement: green.
- Obstruction, unsuitable slope, or prohibited placement: red.
- Committing a placement creates a persistent construction foundation.
- The player physically carries and installs materials at individual construction nodes.
- Contextual interaction triggers assembly animations.
- Completed structures replace temporary construction representations with final collision and environmental effects.

### 7.5 Physical navigation tools

A paper topographical map, brass lens compass, and field journal are physical objects. No automatic player marker or magical border updates. Players annotate discovered landmarks, routes, cave entrances, and faction changes manually.

## 8. Flora, fungi, and fictional pharmacopoeia

Plants and fungi have discoverable parts, condition, freshness, hazards, and preparation paths. Harvesting is tactile: cutting leaves, peeling bark, collecting roots, fruit, or mushroom caps. Careless harvesting or poor tools can bruise specimens and accelerate decomposition. A botanical journal records discoveries, appearance, location, uses, recipes, and hazards.

A mortar and pestle, drying rack, clay bowl, and heat source support physical processing. Raw material may be inert, toxic, or unsuitable until prepared. All medicinal outcomes below are fictional game effects and must not be presented as real treatments.

### 8.1 Molineria foliage

- Visual: long spear-shaped green leaves, parallel ridges, approximately 0.8 m in the concept.
- Habitat: slow riverbanks in Sector Alpha, within a narrow river-edge band.
- Processing: clean, unbruised leaf is mechanically ground through a short interaction sequence.
- Output: item_poultice_molineria_fresh.
- Game effect: helps stabilize fictional laceration states and reduces chance of fictional wound contamination. It does not guarantee a perfect cure for every injury.

### 8.2 Wild tobacco cultivar

- Visual: broad oval leaves with a subtle silver sheen from tiny surface hairs.
- Habitat: bright canopy gaps in Sector Gamma.
- Processing: drying and preparation are represented through game-state stages.
- Output: item_salve_antitoxin_tobacco.
- Game effect: a fictional antitoxin item used against the game's invented venom state. Real tobacco is not an antivenom or medical treatment.

### 8.3 Psychotria / Mind Root

- Visual: small woody shrub, glossy dark-green leaves, raised underside nodules.
- Habitat: shaded areas associated with Sector Beta and Oru-Keth territory.
- Processing: combines fictional bark and a rare blue-bruising Leptonia specimen in the mortar.
- Output: item_tonic_sanity_psychotria.
- Game effect: a fictional sanity-support tonic that can reduce some psychological effects. It should not instantly erase every consequence or make the system trivial.

### 8.4 Amauroderma bracket fungus

- Visual: hard cork-like plate, dark chocolate-brown cap, pale porous underside that darkens when damaged.
- Habitat: wet decaying hardwood in Sector Alpha.
- Processing: coarse crushing followed by a long fictional infusion process.
- Output: item_brew_antiparasite_amauroderma.
- Game effect: treats selected fictional internal parasite states and removes their gameplay resource-drain modifier. This is not a real antiparasitic remedy.

## 9. Wildlife and ecosystem simulation

Wildlife is abundant enough to make the rainforest feel alive, but dangerous encounters are not constant.

**Apex predators:** Jaguars and pumas are rare, mobile, and influenced by prey, scent, noise, fire, carcasses, weather, and time. They stalk and ambush, but encounters should be survivable through awareness, avoidance, preparation, and escape. Their presence is not a guaranteed death sentence.

**Venomous and small hazards:** Region-appropriate fictional snakes, spiders, and scorpions may use camouflage and defensive behavior. Poison-dart-frog-like fauna can exist as environmental wildlife and fictional resource lore, but the game must not teach real toxin extraction or use. Leeches and ticks attach in suitable wet environments.

**Prey and ambient fauna:** Tapirs, peccaries, capybaras, birds, frogs, armadillos, caimans, and other fauna create ecological life. Prey responds to sound, scent, visibility, and nearby predators. Animals need territories, feeding patterns, shelter, and population dynamics.

Wildlife populations can be depleted locally and recover over time. Predators respond to carcasses and prey movement. The ecosystem changes when the player overhunts or alters habitat.

## 10. Crafting, construction, cooking, and camp infrastructure

### 10.1 Tactile crafting

The player uses a physical backpack, notebook, and crafting mat. Recipes are discovered through experimentation, found notes, and observations. Materials are placed and combined manually. Tools visibly degrade: stone heads chip, bindings loosen, and damaged tools reduce performance and yields. Tool mass and balance affect handling and exertion.

### 10.2 Construction

Blueprints place a ghost layout, then require physical delivery and assembly:
- Carry logs, sticks, mud bricks, leaves, vines, and other materials.
- Install components at individual nodes.
- Bind, smear, place, or assemble through contextual physical interactions.
- Structures include shelters, walls, roofs, water collectors, racks, smokehouses, fires, mortars, kilns, and furnaces.
- No automatic construction from a menu and no unexplained server snapping.

Structures decay through humidity, rain, mold, and insects. Repair uses appropriate fictional materials such as resin, mud plaster, fired clay, and reinforcement.

### 10.3 Cooking and preservation

Cooking is physical and depends on fuel, heat, time, rain, and weather.

**Smokehouse concept:** a tier-2 structure with hardwood supports, bamboo slats, vine bindings, and leaf/mud elements. Individual meat strips hang on hooks and are slowly smoked. Initial tuning target: around 12 game-hours of processing and preservation up to roughly 30 game-days. A smokehouse reduces scent exposure but does not erase it.

**Earth oven / pib concept:** a buried cooking structure using a lined pit, heated stones, food, and a clay cover. Initial game-time target: approximately 4 game-hours. It produces less visible smoke and light than an open fire, but heat, steam, and scent can still reveal activity.

Campfires need fuel and maintenance. Heavy rain can extinguish an unattended fire. Fire produces smoke visible above the canopy during daylight and light at night. Raw meat, waste, and carcasses create scent that travels downwind and attracts wildlife or scouts. Waste pits, smokehouses, racks, and shelter maintenance matter for long-term camps.

## 11. Metallurgy and advanced material progression

Advanced metalworking is an endgame game progression system. Its mechanics are abstracted for gameplay and are not a real-world metalworking guide.

The intended sequence:
1. Discover and collect river clay and other construction resources.
2. Build and operate a charcoal-producing structure.
3. Acquire fictional cavern ore from the Under-Root.
4. Construct an advanced draft furnace and manage abstract fuel, airflow, insulation, and thermal states.
5. Prepare a game-specific casting mold.
6. Process ore through simulated material states and produce a tool head.
7. Assemble the tool head with a hardwood handle and bindings at the crafting workspace.

The engine uses configurable thermal capacities, fuel density, insulation, ambient conditions, and material transition thresholds. Temperature values and timings in the design notes are balancing targets, not operational instructions. Furnace state must be visible and understandable through the physical watch or direct inspection. Weather affects thermal efficiency.

Advanced tools improve harvesting capability but remain subject to meaningful durability and repair. They are loud and increase the player's acoustic and ecological footprint. No tool should be literally unbreakable if that undermines the established degradation system.

## 12. Tutorial — The Nightmare Crash

Opening sequence:
1. **Descent:** A twin-engine bush plane fails during a tropical storm. Dark cockpit, alarms, branches, turbulence, and a sudden transition to silence.
2. **Canopy hang:** The player wakes suspended upside down in vines and branches around 20 m above the ground, in Sef-Ilun territory. The player examines and interacts with a jammed harness.
3. **Drop:** Releasing the harness causes a fall through branches to muddy ground. Injury is communicated non-graphically through sound, movement, and impaired control.
4. **Body inspection:** The player limps and examines a leg, discovering a metal fragment. The inspection and first-aid interface is introduced without graphic injury detail.
5. **First crafting:** The player finds basic materials and uses a physical crafting mat to make a fictional stabilizing wrap.
6. **Navigation tools:** The smartwatch powers on with low battery and empty nutrient indicators; the brass compass is discovered.
7. **Radio beacon:** Damaged cockpit avionics emit a static-heavy distress beacon. The player can use compass bearings and landmarks to navigate through ferns toward it.

The beacon is an early narrative opportunity, not a forced linear quest. Players can ignore it and explore.

## 13. Multiplayer, persistence, and world memory

The long-term game supports multiplayer and future PvP. Architecture should be server-authoritative for shared state and designed to prevent clients from controlling other players' objects.

Persistent systems should eventually save:
- Player condition, equipment, discoveries, and location.
- Structures and their construction/decay state.
- Regional terrain changes and resource state.
- Wildlife populations and significant events.
- Faction population, territory, relationships, and memory.
- Weather-related persistent changes where appropriate.

Distant simulation is simplified. Near the player, detailed physics and AI run. At medium distance, systems use reduced behavior. Far away, populations, resources, faction goals, and broad regional state update at a lower frequency. This supports a large world without simulating every leaf and animal at full fidelity.

## 14. Engineering architecture

The current repository uses Three.js, Vite, and JavaScript. It is a browser-first desktop project with an eventual itch.io HTML build target.

The intended architecture separates systems into modules with clear ownership and event-based communication:
1. World simulation core and game clock.
2. Terrain, streaming, and regional cells.
3. Player movement and interaction.
4. Biometric/survival system.
5. Inventory and physical backpack.
6. Weather and environmental state.
7. Acoustic events and propagation.
8. Wildlife simulation.
9. Faction AI, territory, and memory.
10. Flora, fungi, and processing.
11. Crafting, construction, and structures.
12. Metallurgy and material transitions.
13. Diegetic UI: watch, notebook, journal, map, compass.
14. Persistence and multiplayer networking.

Engineering rules:
- Use a fixed or controlled simulation timestep for stateful calculations.
- Use one authoritative game clock and explicit real-time/game-time conversions.
- Give each system ownership of its data.
- Systems communicate through typed events or explicit APIs, not uncontrolled cross-module mutation.
- Use explicit state machines for player interactions, NPC behavior, processing, construction, and weather.
- Keep tuning values in configuration data.
- Use deterministic regional seeds where procedural generation requires reproducibility.
- Load detailed geometry and AI near the player; simplify distant simulation.
- Profile before increasing world detail or entity counts.
- Keep multiplayer authority and persistence in mind without prematurely implementing them.
- Test each system in isolation and in combination before adding dependencies.

The conceptual 60 × 60 grid has 3,600 horizontal cells. With four ecological layers it represents up to 14,400 regional-layer state slots, but not all slots need active high-detail simulation simultaneously.

## 15. Development process and canon rules

Suggested development order:
1. Repository audit and technical foundation.
2. Modular world simulation core, game clock, configuration, and event interfaces.
3. Terrain/world streaming foundation and scale strategy.
4. Player movement, camera, and physical interaction foundation.
5. Backpack and inventory geometry.
6. Biometric survival and diegetic smartwatch.
7. Weather, water, and regional environmental changes.
8. Acoustic events and wildlife.
9. Faction simulation, communication, and territorial memory.
10. Botanical discovery and processing.
11. Notebook, crafting, and physical construction.
12. Cooking, camp infrastructure, and metallurgy.
13. Persistence and multiplayer.
14. Visual/audio polish, optimization, testing, and release preparation.

This is a development sequence, not permission to skip testing or implement every system at once.

**Canon rules:**
- Everything established in this document is official design.
- New ideas are additions unless the designer explicitly revises a decision.
- Numerical values are starting targets and may be adjusted through documented testing.
- Do not add surprise features outside the agreed design.
- Do not claim a feature is implemented until it exists and has been tested.
- Preserve the intended realism, systemic depth, and diegetic presentation.
- The designer has authorized repository edits. Make careful, reviewable changes, inspect current code before editing, and validate builds after code changes.



## 17. New approved systems — parasite lifecycle, predator pressure, and footprint

These mechanics extend the existing ecology, survival, wildlife, and faction canon. They must be implemented as interacting systems, not isolated status effects.

### 17.1 Amoebic infestation — The Internal Siphon

- Exposure route: drinking untreated swamp or otherwise contaminated water. The prototype's unfiltered-water interaction is the first implementation entry point.
- Initial infection chance: 35% per untreated-water exposure, subject to balance testing.
- Incubation: 12 game-hours before the active phase.
- Active effect: incoming carbohydrate value is reduced by 40% before the player's existing hunger/nutrient recovery is applied.
- Feedback: intermittent abdominal discomfort and a smartwatch diagnostic such as “ERR: BIO-LEAK.” The display should signal a problem without making the watch omniscient.
- Do not force a sudden camera snap or interrupt precision movement. Use a brief, bounded discomfort cue and optional aim sway that remains controllable.
- The parasite lifecycle is modeled separately from the legacy generic parasite meter so additional pathogen types can be added without mixing their rules.

### 17.2 Botfly-like subcutaneous parasite — The Living Flesh

This is a fictional, non-graphic survival condition. It is not a medical simulation.

- Exposure may occur after sustained unprotected contact with a high-scent environment or after unsafe rest conditions are implemented.
- Initial exposure target: 10 continuous unsheltered minutes.
- Development: 48 game-hours.
- Body inspection identifies the affected limb through a localized, non-graphic visual indicator.
- Treatment is a multi-stage game interaction: apply fictional resin, wait 2 game-hours, then complete a brief non-graphic extraction interaction.
- Treatment stages are explicit states so interruptions, persistence, and multiplayer synchronization can be added later.
- The current prototype contains the lifecycle model and developer test controls. Natural carcass-scent and bare-ground-rest exposure triggers, plus the physical body-inspection interface, remain later integration tasks.

### 17.3 Predator stalking and threat evaluation

Jaguars should use a state machine rather than arbitrary waypoint wandering:
- Roaming and territory search.
- Detection and evidence gathering.
- Silent shadowing from brush or suitable elevated routes.
- Threat evaluation based on player movement, condition, equipment, visibility, and escape routes.
- A clear warning/commitment phase before an attack.
- Retreat when the player establishes a strong fire barrier or breaks line of sight and escapes the immediate threat zone.

Predators do not literally cancel their sound footprint or perfectly match player footsteps. They remain quiet through behavior and environmental cover, but observant players should receive fair audio/visual clues. Player condition may influence predator interest but must not produce unavoidable attacks against an injured player. Fire discourages approach; it is not a universal instant-delete button.

**Prototype implementation:** Jaguars now have roaming, stalking, warning, pouncing, and retreating states. Stalking approaches from behind the player's facing direction; a warning window precedes a pounce; a nearby campfire triggers retreat. A 3% spawn check runs once per real-time minute at night when no jaguar is active. The current prototype treats its small forest map as eligible habitat; regional biome-density checks will replace this placeholder on the larger world.

### 17.4 Micro-fauna ground hazards

Ant columns and similar dense ground fauna are regional hazards. They should be visible and avoidable, with protective clothing or mud barriers reducing exposure. Contact creates a temporary movement/comfort penalty and a fictional toxicity or irritation state. Avoid forced, uninterruptible animations and instant catastrophic damage; the player must retain meaningful control and escape options.

### 17.5 Industrial smoke and air pollution

Industrial structures emit persistent smoke into regional air state. Emissions accumulate in the relevant regional cell and disperse or decay according to weather and wind. The player can see smoke above the canopy in suitable conditions.

- Initial pollution threshold: 50.
- Initial sustained exposure threshold: 48 game-hours above that value.
- Sef-Ilun stance can escalate from observant to hostile after sustained, locally detected pollution.
- This is not an omniscient global switch. Scouts must detect and report the plume; knowledge propagates through faction communication.
- Hostility can lead to surveillance, warnings, sabotage, raids, or attacks on exposed infrastructure. A raid must be telegraphed and have counterplay; destruction of a base is not automatic.
- The prototype now has a pollution accumulator, decay, threshold timer, and Sef-Ilun response state. Actual kiln/furnace emitters and faction scouts are future integration points.

### 17.6 Scent vector matrix

Scent sources include carcasses, exposed raw food, and unburied organic waste. Wind projects scent downwind as a directional, weakening corridor rather than a perfect circle. AI receives approximate scent strength and direction, not exact player coordinates.

The prototype records harvested carcass scent sources and uses proximity to an unprotected carcass to accumulate the botfly exposure timer; a nearby campfire interrupts and resets that exposure. The downwind-corridor calculation is independently tested but is not yet connected to predator or faction receivers. The current prototype uses a local proximity check and a simple weather placeholder, not the final regional wind/scent field.

### 17.7 Implementation boundaries

The new lifecycle and pollution logic is modular and covered by unit tests. Developer controls can exercise the new states before their world interactions exist. Do not mistake a test control or data model for a fully implemented physical interaction, faction, or wildlife behavior.

## 16. Current implementation status

This document records intended design, not current feature completion.

The existing repository is an early prototype with a small procedural terrain area, first-person movement, basic survival values, gathering/crafting, simple wildlife, basic weather, a field journal, and a developer debug panel. The prototype architecture is not yet the final architecture described above.

The current prototype must be audited before any major refactor. Keep working behavior where useful, but do not preserve monolithic structures merely for compatibility if they prevent the approved architecture. Changes should be staged, testable, and reversible.
