import test from "node:test";
import assert from "node:assert/strict";
import {
  createEcologyState,
  exposeToAmoebicParasite,
  absorbCarbohydrates,
  exposeToBotflyScent,
  applyResinToBotfly,
  completeBotflyExtraction,
  emitIndustrialSmoke,
  advanceEcology,
  calculateDownwindScent,
  advanceJaguarState
} from "../src/systems/ecology.js";

test("amoebic infestation incubates for twelve game-hours", () => {
  const ecology = createEcologyState();
  assert.equal(exposeToAmoebicParasite(ecology, () => 0.1), true);
  advanceEcology(ecology, 11.5);
  assert.equal(ecology.amoebic.phase, "incubating");
  advanceEcology(ecology, 0.5);
  assert.equal(ecology.amoebic.phase, "active");
});

test("active amoebic infestation absorbs only sixty percent of carbohydrate gain", () => {
  const ecology = createEcologyState();
  exposeToAmoebicParasite(ecology, () => 0);
  advanceEcology(ecology, 12);
  assert.equal(absorbCarbohydrates(ecology, 20), 12);
});

test("botfly exposure needs ten unsheltered minutes and has a two-day development phase", () => {
  const ecology = createEcologyState();
  assert.equal(exposeToBotflyScent(ecology, 9, false), false);
  assert.equal(exposeToBotflyScent(ecology, 1, false), true);
  advanceEcology(ecology, 47);
  assert.equal(ecology.botfly.phase, "developing");
  advanceEcology(ecology, 1);
  assert.equal(ecology.botfly.phase, "active");
});

test("resin treatment creates a two-hour wait before the non-graphic extraction step", () => {
  const ecology = createEcologyState();
  exposeToBotflyScent(ecology, 10, false);
  advanceEcology(ecology, 48);
  assert.equal(applyResinToBotfly(ecology), true);
  advanceEcology(ecology, 2);
  assert.equal(ecology.botfly.phase, "extraction_ready");
  assert.equal(completeBotflyExtraction(ecology), true);
  assert.equal(ecology.botfly.phase, "clear");
});

test("smoke pollution must remain above threshold for forty-eight game-hours", () => {
  const ecology = createEcologyState();
  emitIndustrialSmoke(ecology, 55);
  advanceEcology(ecology, 47);
  assert.equal(ecology.sefIlunStance, "observant");
  emitIndustrialSmoke(ecology, 5);
  advanceEcology(ecology, 1);
  assert.equal(ecology.sefIlunStance, "hostile");
});

test("downwind scent is strongest inside the wind corridor", () => {
  const source = { x: 0, z: 0, intensity: 1 };
  assert.ok(calculateDownwindScent(source, { x: 10, z: 0 }, { x: 1, z: 0 }) > 0);
  assert.equal(calculateDownwindScent(source, { x: -10, z: 0 }, { x: 1, z: 0 }), 0);
  assert.equal(calculateDownwindScent(source, { x: 10, z: 100 }, { x: 1, z: 0 }), 0);
});

test("jaguar shadows at distance, warns before pouncing, and retreats from nearby fire", () => {
  const jaguar = { aiState: "roaming", warningTimer: 0 };
  assert.equal(advanceJaguarState(jaguar, { distance: 18, fireDistance: 30 }, 0.1), "stalking");
  assert.equal(advanceJaguarState(jaguar, { distance: 5, fireDistance: 30 }, 0.1), "warning");
  assert.equal(advanceJaguarState(jaguar, { distance: 5, fireDistance: 30, playerSprinting: true }, 2.5), "pouncing");
  assert.equal(advanceJaguarState(jaguar, { distance: 5, fireDistance: 4 }, 0.1), "retreating");
});
