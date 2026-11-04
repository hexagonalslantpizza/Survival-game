import test from "node:test";
import assert from "node:assert/strict";
import { createTerrorState, advanceTerrorState, triggerTabooConsumption, shouldShowPeripheralActor } from "../src/systems/terror.js";

test("phase three requires sustained sanity below fifteen percent", () => {
  const terror = createTerrorState();
  advanceTerrorState(terror, 10, 19);
  assert.equal(terror.phase, 2);
  advanceTerrorState(terror, 10, 1);
  assert.equal(terror.phase, 3);
  assert.equal(terror.mimicEnabled, true);
  assert.equal(terror.watchCorrupted, true);
});

test("terror pressure recedes after sanity recovers above twenty percent", () => {
  const terror = createTerrorState();
  advanceTerrorState(terror, 5, 22);
  advanceTerrorState(terror, 50, 6);
  assert.equal(terror.phase, 2);
  assert.equal(terror.shadowActorsEnabled, false);
});

test("taboo consequence is permanent and idempotent", () => {
  const terror = createTerrorState();
  assert.equal(triggerTabooConsumption(terror), true);
  assert.equal(triggerTabooConsumption(terror), false);
  assert.equal(terror.voiceProfile, "feral");
  assert.equal(terror.factionThreat, "ecosystem_hunt");
});

test("shadow actors remain visible only outside the central sixty degrees", () => {
  assert.equal(shouldShowPeripheralActor(0, Math.PI / 3), true);
  assert.equal(shouldShowPeripheralActor(0, 0), false);
  assert.equal(shouldShowPeripheralActor(0, Math.PI / 6), false);
});
