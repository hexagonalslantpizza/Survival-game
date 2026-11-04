export function createEcologyState() {
  return {
    amoebic: { phase: "clear", incubationHoursRemaining: 0 },
    botfly: { phase: "clear", exposureMinutes: 0, developmentHoursRemaining: 0, resinApplied: false },
    airPollutionLoad: 0,
    hoursAbovePollutionThreshold: 0,
    sefIlunStance: "observant"
  };
}

export function exposeToAmoebicParasite(ecology, random = Math.random) {
  if (ecology.amoebic.phase !== "clear" || random() >= 0.35) return false;
  ecology.amoebic.phase = "incubating";
  ecology.amoebic.incubationHoursRemaining = 12;
  return true;
}

export function absorbCarbohydrates(ecology, amount) {
  const safeAmount = Math.max(0, Number(amount) || 0);
  return ecology.amoebic.phase === "active" ? safeAmount * 0.6 : safeAmount;
}

export function exposeToBotflyScent(ecology, minutes, shelteredBySmoke = false) {
  if (shelteredBySmoke || ecology.botfly.phase !== "clear") return false;
  ecology.botfly.exposureMinutes += Math.max(0, Number(minutes) || 0);
  if (ecology.botfly.exposureMinutes < 10) return false;
  ecology.botfly.phase = "developing";
  ecology.botfly.developmentHoursRemaining = 48;
  return true;
}

export function applyResinToBotfly(ecology) {
  if (ecology.botfly.phase !== "active" || ecology.botfly.resinApplied) return false;
  ecology.botfly.resinApplied = true;
  ecology.botfly.phase = "treatment_wait";
  ecology.botfly.developmentHoursRemaining = 2;
  return true;
}

export function completeBotflyExtraction(ecology) {
  if (ecology.botfly.phase !== "extraction_ready") return false;
  ecology.botfly.phase = "clear";
  ecology.botfly.exposureMinutes = 0;
  ecology.botfly.developmentHoursRemaining = 0;
  ecology.botfly.resinApplied = false;
  return true;
}

export function emitIndustrialSmoke(ecology, amount) {
  ecology.airPollutionLoad = Math.min(100, ecology.airPollutionLoad + Math.max(0, Number(amount) || 0));
  return ecology.airPollutionLoad;
}

export function advanceEcology(ecology, gameHours) {
  const hours = Math.max(0, Number(gameHours) || 0);
  const amoebic = ecology.amoebic;
  if (amoebic.phase === "incubating") {
    amoebic.incubationHoursRemaining = Math.max(0, amoebic.incubationHoursRemaining - hours);
    if (amoebic.incubationHoursRemaining === 0) amoebic.phase = "active";
  }

  const botfly = ecology.botfly;
  if (botfly.phase === "developing" || botfly.phase === "treatment_wait") {
    botfly.developmentHoursRemaining = Math.max(0, botfly.developmentHoursRemaining - hours);
    if (botfly.developmentHoursRemaining === 0) {
      botfly.phase = botfly.phase === "developing" ? "active" : "extraction_ready";
    }
  }

  ecology.airPollutionLoad = Math.max(0, ecology.airPollutionLoad - hours * 0.08);
  if (ecology.airPollutionLoad >= 50) {
    ecology.hoursAbovePollutionThreshold += hours;
    if (ecology.hoursAbovePollutionThreshold >= 48) ecology.sefIlunStance = "hostile";
  } else {
    ecology.hoursAbovePollutionThreshold = 0;
    if (ecology.airPollutionLoad < 30) ecology.sefIlunStance = "observant";
  }
}

export function calculateDownwindScent(source, observer, wind, maxDistance = 1000) {
  const windLength = Math.hypot(wind.x, wind.z);
  if (windLength < 0.0001 || maxDistance <= 0) return 0;
  const wx = wind.x / windLength;
  const wz = wind.z / windLength;
  const dx = observer.x - source.x;
  const dz = observer.z - source.z;
  const downwindDistance = dx * wx + dz * wz;
  if (downwindDistance <= 0 || downwindDistance >= maxDistance) return 0;
  const crosswindDistance = Math.abs(dx * wz - dz * wx);
  const corridorWidth = Math.max(2, downwindDistance * 0.35);
  if (crosswindDistance >= corridorWidth) return 0;
  const distanceFactor = 1 - downwindDistance / maxDistance;
  const lateralFactor = 1 - crosswindDistance / corridorWidth;
  return Math.max(0, Math.min(1, distanceFactor * lateralFactor * (source.intensity ?? 1)));
}

export function advanceJaguarState(animal, context, delta) {
  const distance = Math.max(0, context.distance);
  const fireDistance = Number.isFinite(context.fireDistance) ? context.fireDistance : Infinity;
  const sprinting = Boolean(context.playerSprinting);
  animal.aiState ??= "roaming";
  animal.warningTimer ??= 0;

  if (fireDistance < 7) {
    animal.aiState = "retreating";
    animal.warningTimer = 0;
    return animal.aiState;
  }
  if (animal.aiState === "retreating") {
    if (distance > 28 && fireDistance > 10) animal.aiState = "roaming";
    return animal.aiState;
  }
  if (distance > 22) {
    animal.aiState = "roaming";
    animal.warningTimer = 0;
    return animal.aiState;
  }
  if (animal.aiState === "pouncing") return animal.aiState;
  if (animal.aiState === "warning") {
    animal.warningTimer = Math.max(0, animal.warningTimer - Math.max(0, delta));
    if (distance > 10) {
      animal.aiState = "stalking";
      animal.warningTimer = 0;
    } else if (animal.warningTimer === 0 && (sprinting || distance < 5.5)) {
      animal.aiState = "pouncing";
    } else if (animal.warningTimer === 0) {
      animal.aiState = "stalking";
    }
    return animal.aiState;
  }
  if (distance < 6) {
    animal.aiState = "warning";
    animal.warningTimer = 2.5;
  } else {
    animal.aiState = "stalking";
  }
  return animal.aiState;
}
