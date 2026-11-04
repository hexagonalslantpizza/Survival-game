# WILDLANDS engine migration

**Decision date:** 2026-11-04  
**Approved engine:** Godot 4.7.2  
**Target:** Desktop PC, first-person 3D survival game

## Migration rules

- Godot 4.7.2 is the primary engine for new WILDLANDS runtime work.
- The existing browser-based Three.js/Vite implementation remains in the repository as a reference until its behavior has been ported and checked.
- Preserve the approved WILDLANDS master design. The engine change does not remove or replace its world, factions, ecology, survival, navigation, smartwatch, or atmosphere requirements.
- Do not add gameplay features during the migration. Recreate existing approved behavior; do not expand scope without the user's request.
- Do not claim feature parity until each ported system has been implemented and tested.
- Keep the existing JavaScript test suite and browser prototype intact until the Godot replacements are verified.

## Initial Godot migration contents

The first Godot project milestone contains:
- Godot 4.7 project configuration and a runnable main scene.
- Seeded procedural rolling terrain and the existing prototype's approximate forest composition.
- First-person movement, mouse look, jumping, sprinting, and fall-damage calculation.
- Survival state and time progression.
- GDScript ports of ecology, notebook recipe discovery, and terror state logic.
- A headless GDScript test runner for those logic systems.

## Not yet ported

The initial project does not yet provide full parity with the browser prototype. The following existing systems remain to be migrated:
- Inventory, gathering, crafting, journal interaction, and construction.
- Full wildlife/resource/water interactions and scene behavior.
- Smartwatch model and deliberate inspection interface.
- Rain/weather effects and complete lighting response.
- Complete survival interaction and diagnostic presentation.
- Save/persistence and multiplayer.

The first Godot milestone is a working foundation, not a claim that all these systems are already playable.
