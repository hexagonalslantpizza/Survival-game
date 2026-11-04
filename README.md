# WILDLANDS

WILDLANDS is a first-person rainforest survival simulation. Its approved design is documented in [docs/WILDLANDS_MASTER_SPEC.md](docs/WILDLANDS_MASTER_SPEC.md).

## Current engine

**Godot 4.7.2** is now the primary engine. The Godot project is in [GodotProject/](GodotProject/).

To open it:
1. Start Godot 4.7.2.
2. In Project Manager, choose **Import**.
3. Select `GodotProject/project.godot`.
4. Open the project and press **F5**.

For controls, current migration status, and test instructions, see [GodotProject/README.md](GodotProject/README.md).

## Migration status

The browser-based Three.js prototype remains in the repository root as a reference implementation. Its code and JavaScript tests are being preserved while approved systems are ported to Godot. The Godot project currently includes the procedural terrain/vegetation foundation, first-person movement, survival state, and GDScript ports of the ecology, notebook discovery, and terror logic.

**The Godot project is not yet at full feature parity.** Inventory, gathering, crafting, the smartwatch interface, full wildlife interactions, weather effects, construction, and other existing systems still need to be ported. See [docs/ENGINE_MIGRATION.md](docs/ENGINE_MIGRATION.md).

The existing browser prototype can still be run with Node.js using `npm install` and `npm run dev`; it is retained for reference and comparison, not the primary runtime.

## Project principles

- Preserve the approved design canon.
- Do not add unrequested gameplay features.
- Build and test systems before marking them complete.
- Prefer systemic cause and effect over disconnected UI meters.
- Keep the physical smartwatch, backpack, notebook, compass, and paper map as the intended diegetic interfaces.
