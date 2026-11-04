# WILDLANDS — Godot project

This is the Godot 4.7.2 implementation of WILDLANDS.

## Open the project

1. Open Godot 4.7.2.
2. Choose **Import** in the Project Manager.
3. Select this folder's `project.godot` file.
4. Import and open the project.
5. Press **F6** only when testing a selected scene; press **F6** is not needed for the game. Press **F5** to run the main scene.

The first run generates the current prototype terrain and vegetation. Click the game window to capture the mouse. Use WASD to move, mouse to look, Shift to sprint, Space to jump, and Escape to release the mouse. Click again to recapture it.

## Current Godot port

- Godot 4.7 project configuration and main scene.
- Procedural rolling terrain based on the browser prototype's seeded height function.
- Procedurally placed trees, buttress roots, canopy clusters, ferns, and rocks.
- First-person CharacterBody3D movement, mouse look, jumping, sprinting, and fall damage.
- Survival values and time progression.
- Ported ecology state logic, including infestation timing, pollution response, scent calculation, and jaguar state transitions.
- Ported notebook recipe discovery logic.
- Ported terror phase and irreversible taboo-state logic.
- A headless GDScript test runner for the ported logic.

This is a migration foundation, not full feature parity with the browser prototype. The existing inventory, gathering, crafting interactions, animal scene behavior, smartwatch model/interface, rain effects, construction, and complete survival interactions still need to be ported. They are not being represented as finished.

## Run the system tests

From a terminal with Godot 4.7.2 available on PATH:

```bash
godot --headless --path GodotProject --script res://tests/run_tests.gd
```

On Windows, the executable may be named `Godot_v4.7.2-stable_win64.exe`; use its full path if the `godot` command is not available.

## Repository layout

The browser prototype remains in the repository root as a reference implementation. The Godot project lives in this folder so the old prototype and its automated JavaScript tests are preserved during migration.
