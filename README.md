# WILDLANDS — Tropical Survival

A browser-based, first-person 3D wilderness survival game.

This README is written for people who have never run a project like this before. Follow the setup guide in order and you should be able to launch the game on your computer.

---

# 1. What is this project?

WILDLANDS is a 3D tropical wilderness survival game that runs in a web browser.

The long-term goal is a survival experience with systems such as:

- Exploring a dense tropical environment
- Gathering materials and crafting equipment
- Managing hunger, thirst, health, stamina, and other survival needs
- Finding and preparing food and clean water
- Discovering plants and medicinal resources
- Encountering wildlife
- Building shelters and fires
- Hunting and defending yourself
- A journal for discovered items, animals, and recipes
- Multiplayer and player-versus-player gameplay

**Important:** Not all of these systems are in the current version. The current build is an early 3D world prototype. The other features will be added in stages.

## What currently works?

The current playable prototype includes:

- Procedurally generated rolling terrain, tropical trees, ferns, and rocks
- First-person camera, mouse look, walking, and sprinting
- Health, hunger, thirst, stamina, and sanity
- Resource gathering, basic tree chopping with a stone axe, and an inventory
- Crafting recipes for rope, spear, bow, arrows, bandages, campfires, and shelters
- Wild fruit, coconuts, medicinal herbs, stones, flint, sticks, and plant fiber
- Freshwater pools, unsafe water, and boiling water at a campfire
- Hunting and harvesting basic wildlife
- Cooking raw meat at a campfire
- Wounds, infection progression, parasites, and basic treatments
- A field journal for discoveries
- A day/night cycle and a testable rain weather state
- A developer debug menu opened with F3
- A modular ecology lifecycle prototype for untreated-water infestation, carcass exposure, and industrial smoke response
- Automated unit tests for parasite timing, pollution thresholds, scent direction, and predator state transitions

**Still not implemented:** multiplayer, PvP networking, advanced animal animations/behaviors, a full range of disease types, advanced construction, and final itch.io release packaging. The wildlife models and survival rules are early prototypes and need playtesting.

---

# 2. What you need

You will need:

1. A Windows, macOS, or Linux computer
2. An internet connection for the initial setup
3. **Node.js** (which includes npm)
4. A code editor, preferably **Visual Studio Code**
5. A modern web browser

You do not need Roblox Studio, Unity, or Unreal Engine to run this project.

## Install Node.js

Node.js lets your computer run the development tools used by this game. npm comes with Node.js and installs the project's required packages.

1. Visit the official Node.js website: https://nodejs.org/
2. Download a current **LTS** version.
3. Open the downloaded installer.
4. Follow the installation steps. The default options are fine.
5. When installation finishes, close and reopen any terminal windows.

The project requires Node.js **20.19+ or 22.12+**.

## Install Visual Studio Code

Visual Studio Code is a free code editor. It makes it easier to open the project folder and use its built-in terminal.

1. Visit https://code.visualstudio.com/
2. Download Visual Studio Code for your operating system.
3. Run the installer.
4. Open Visual Studio Code after installation.

You can use another code editor if you already have one, but the instructions below use Visual Studio Code.

---

# 3. Download the game

You have two options. If you do not use Git, choose Option A.

## Option A — Download ZIP (easiest)

1. Open the project repository:

   https://github.com/hexagonalslantpizza/Survival-game

2. Click the green **Code** button.
3. Click **Download ZIP**.
4. Wait for the download to finish.
5. Find the downloaded ZIP file. It is usually in your Downloads folder.
6. Right-click it and choose **Extract All**.
7. Choose somewhere easy to find, such as your Desktop or Documents folder.
8. Open the extracted folder.

You should see files and folders including:

- `package.json`
- `index.html`
- `README.md`
- `src`

**Do not try to launch the game by double-clicking `index.html`.** This project uses Vite, so it needs to be started through the terminal.

## Option B — Clone with Git

If Git is installed, open a terminal in the folder where you want the project and run:

```bash
git clone https://github.com/hexagonalslantpizza/Survival-game.git
cd Survival-game
```

---

# 4. Open the project in Visual Studio Code

1. Open Visual Studio Code.
2. Click **File** in the top-left corner.
3. Select **Open Folder**.
4. Find and select the extracted `Survival-game` folder.
5. Click **Select Folder**.

Make sure you opened the actual project folder — the one containing `package.json` and `index.html`.

## Open the terminal

In Visual Studio Code:

1. Click **Terminal** in the top menu.
2. Select **New Terminal**.
3. A terminal panel should appear at the bottom of the window.

The terminal is where you enter commands to install and start the game.

---

# 5. Check that Node.js and npm are installed

In the terminal, enter:

```bash
node -v
```

Press Enter.

You should see a version number. It must meet the requirement listed in Section 2.

Now enter:

```bash
npm -v
```

Press Enter again.

You should also see a version number.

If either command says it is not recognized or cannot be found, Node.js may not have installed correctly. Install the LTS version again, then restart Visual Studio Code.

---

# 6. Install the game's packages

Make sure the terminal is open in the project folder — the folder containing `package.json`.

Enter:

```bash
npm install
```

Press Enter and wait.

This downloads the libraries the project needs, including:

- **Three.js** — renders the 3D world
- **Vite** — runs the local development server and creates production builds

The first installation can take a little while.

When it finishes, a `node_modules` folder will appear. That is normal. You do not need to edit anything inside it.

You only need to run `npm install` again if the project's dependencies change or you are setting up a fresh copy.

---

# 7. Launch the game

Now enter:

```bash
npm run dev
```

Press Enter.

Vite should start a local development server. The terminal will show a message with a local address, usually similar to:

```text
Local: http://localhost:5173/
```

1. Hold Ctrl and click the address in the terminal, or copy it.
2. Open your web browser.
3. Visit that address.

**The game should now appear in your browser!**

Keep the terminal open while playing. The development server runs from that terminal window.

To stop the server, return to the terminal and press:

```text
Ctrl + C
```

If Windows asks whether you want to terminate the process, confirm.

To play again later, open the project folder in Visual Studio Code and run:

```bash
npm run dev
```

You do not need to repeat `npm install` every time.

---

# 8. Game controls

| Input | Action |
|---|---|
| WASD | Move |
| Mouse | Look around |
| Shift | Sprint |
| Space | Jump |
| E | Gather, chop trees (with an axe), collect water, cook, or interact |
| I or Tab | Inventory |
| C | Crafting |
| J | Field journal |
| B | Build mode |
| 1 | Place campfire while in build mode |
| 2 | Place shelter while in build mode |
| Left mouse | Hunt with a spear, or bow and arrow |
| F3 | Open/close developer debug menu |
| Esc | Pause and release the mouse |

## Mouse and pause behavior

- Click the start button to begin.
- The game captures your mouse so you can look around.
- Press Esc to pause and release the mouse.
- Use the pause screen to return to the game.
- Inventory, crafting, and journal panels release the mouse so their buttons can be clicked. Close a panel with its CLOSE button or Esc, then click RETURN TO GAME.

## F3 developer debug menu

Press **F3** while playing to open the developer panel. It releases the mouse so you can use the controls.

The current debug panel includes:
- Direct sliders for health, hunger, thirst, stamina, sanity, infection, parasites, wetness, time of day, and day number.
- God mode and survival simulation toggles.
- Easy, normal, and hard difficulty selection.
- Clear/rain weather selection.
- Spawn selected inventory items or a large batch of materials.
- Spawn wildlife and freshwater pools.
- Place a campfire or shelter for testing.
- Teleport to the starting area or a random location.
- Advance to the next day.
- Add wounds, infection, parasites, or player damage.
- Heal the player, reset survival stats, clear inventory, or reset counters.
- A live readout of player position, wildlife, resources, inventory, survival conditions, FPS, draw calls, and triangle count.

Debug changes are temporary and are not saved. F3 is a development/testing tool, not a multiplayer admin system.

---

# 9. Troubleshooting

Here are some common problems and what to try.

## "npm is not recognized"

Node.js is missing, or Windows cannot find its installation.

Try:
1. Install Node.js LTS from https://nodejs.org/
2. Finish the installer.
3. Close and reopen Visual Studio Code.
4. Open a new terminal.
5. Try `npm -v` again.

## "Missing script: dev"

You are probably not in the correct folder.

The terminal must be inside the project folder containing `package.json`.

In Visual Studio Code, use **File → Open Folder** and select the correct folder.

## "Cannot find package" or "Cannot find module"

The dependencies may not have installed.

In the project folder, run:

```bash
npm install
```

Then try:

```bash
npm run dev
```

## The browser says the site cannot be reached

Check that:
- The terminal is still running `npm run dev`.
- Vite did not print an error.
- You are opening the exact local address printed by Vite.

If the default port is busy, Vite may choose another port. Use the address it actually prints.

## The game is a blank screen

1. Wait a few seconds.
2. Refresh the browser.
3. Check the terminal for errors.
4. Open the browser developer console with F12 and look for red error messages.

If it still does not work, copy the error message and include it when reporting the problem.

## The game feels slow

This is an early 3D prototype with a forest environment. Try:
- Closing other demanding applications.
- Closing extra browser tabs.
- Using a modern browser with hardware acceleration enabled.
- Checking whether your graphics drivers are up to date.

---

# 10. Making a production build

The development server is for working on the game. A production build creates the files that can be hosted as a website or prepared for itch.io.

In the project folder, run:

```bash
npm run build
```

Vite will create a folder called:

```text
dist
```

That folder contains the built game files.

You can test the production build locally with:

```bash
npm run preview
```

Open the local address printed by Vite.

**For itch.io:** the eventual browser release will use the contents of the `dist` folder as an HTML game upload. The current project is not yet a finished itch.io release.

---

# 11. Project folder guide

Here is what the important files do:

| File or folder | Purpose |
|---|---|
| `index.html` | Main webpage and game interface |
| `src/main.js` | Main Three.js game code |
| `src/systems/ecology.js` | Modular parasite, pollution, scent, and wildlife state logic |
| `tests/` | Automated system tests (`npm test`) |
| `src/style.css` | Menus, HUD, and visual styling |
| `package.json` | Project information, dependencies, and commands |
| `package-lock.json` | Records the exact installed dependency versions |
| `node_modules/` | Downloaded packages (created by npm install) |
| `dist/` | Production build (created by npm run build) |
| `README.md` | This guide |

---

# 12. Development roadmap

The game is being built in stages so each system can be tested before more systems depend on it.

1. **World foundation** — terrain, vegetation, rocks, movement, and camera.
2. **Expanded survival** — deeper health, hunger, thirst, stamina, sanity, sleep, and environmental effects.
3. **Expanded items and crafting** — more inventory items, gathering, tools, and recipes.
4. **Biology and injuries** — more wound types, infection, parasites, diseases, treatments, and medicinal plants.
5. **Wildlife** — improved animal models, behavior, encounters, and hunting.
6. **Construction** — more fires, shelters, ropes, and base building.
7. **Journal and difficulty** — more discoveries, information, and balanced difficulty settings.
8. **Multiplayer and release preparation** — networking, PvP, testing, and itch.io preparation.

These are planned stages. A feature should not be considered playable until it has actually been implemented and tested.

---

# 13. Project principles

- Build and test systems in stages.
- Keep systems modular as the project grows.
- Do not add surprise features outside the agreed design.
- Use believable cause-and-effect for survival, injury, infection, food, water, and animal behavior.
- Disease transmission should use appropriate routes, not simply infect players because they stand near each other.
- Animal encounters should have believable behavior and opportunities to escape.
- Keep multiplayer compatibility in mind without rushing multiplayer implementation.

---

# Need help?

If the game does not launch, include:
- Your operating system
- The command you entered
- The full error message from the terminal
- Any red errors from the browser console

That makes it much easier to find and fix the problem.

Have fun exploring!
