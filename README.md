# WILDLANDS — Tropical Survival

A browser-based, first-person 3D wilderness survival game.

## Current milestone

The first milestone is a playable world foundation:
- Procedural rolling terrain
- Dense tropical trees, ferns, and rocks
- Atmospheric lighting and distance fog
- First-person mouse look
- WASD movement and sprinting
- Responsive start and pause screens

Survival, crafting, wildlife, disease, building, and multiplayer systems are planned milestones, not implemented yet.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

The production output is written to `dist/`. It can be hosted as a static website, including on itch.io as an HTML game.

## Controls

- WASD: Move
- Mouse: Look
- Shift: Sprint
- Esc: Pause / release mouse

## Project principles

- Build and test systems in stages.
- Keep systems modular as the project grows.
- Avoid surprise features outside the agreed design.
- Use believable cause-and-effect for survival, injury, infection, food, water, and animal behavior.
- Keep multiplayer compatibility in mind without rushing multiplayer implementation.
