export function createTerrorState() {
  return {
    phase: 0,
    lowSanitySeconds: 0,
    mimicEnabled: false,
    shadowActorsEnabled: false,
    watchCorrupted: false,
    tabooConsumed: false,
    voiceProfile: "human",
    factionThreat: "normal"
  };
}

export function advanceTerrorState(terror, sanity, delta) {
  const dt = Math.max(0, Number(delta) || 0);
  if (sanity < 15) {
    terror.lowSanitySeconds += dt;
  } else if (sanity > 20) {
    terror.lowSanitySeconds = Math.max(0, terror.lowSanitySeconds - dt * 2);
  }
  terror.phase = terror.lowSanitySeconds >= 20 ? 3 : terror.lowSanitySeconds >= 8 ? 2 : terror.lowSanitySeconds > 0 ? 1 : 0;
  terror.mimicEnabled = terror.phase === 3;
  terror.shadowActorsEnabled = terror.phase === 3;
  terror.watchCorrupted = terror.phase === 3;
  return terror;
}

export function triggerTabooConsumption(terror) {
  if (terror.tabooConsumed) return false;
  terror.tabooConsumed = true;
  terror.voiceProfile = "feral";
  terror.factionThreat = "ecosystem_hunt";
  return true;
}

export function shouldShowPeripheralActor(cameraYaw, actorYaw, centralViewDegrees = 60) {
  let difference = (actorYaw - cameraYaw + Math.PI * 3) % (Math.PI * 2) - Math.PI;
  return Math.abs(difference) > (centralViewDegrees * Math.PI / 360) && Math.abs(difference) < Math.PI * 0.78;
}
