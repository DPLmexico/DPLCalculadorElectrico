/**
 * Módulo de Impedancia
 * Cálculos de Z, R, X y ángulo de fase φ
 */

export function impedanceCalculator({ mode, Z, R, X }) {
  if (mode === "ZfromRX") {
    return calcZfromRX(R, X);
  }
  if (mode === "RfromZX") {
    return calcRfromZX(Z, X);
  }
  if (mode === "XfromZR") {
    return calcXfromZR(Z, R);
  }
  if (mode === "phaseAngle") {
    return calcPhaseAngle(R, X);
  }
  if (mode === "allFromRX") {
    return calcAllFromRX(R, X);
  }
  return null;
}

function validateImpedanceParam(val, name) {
  if (typeof val !== "number" || !isFinite(val)) {
    return `${name} debe ser un número finito.`;
  }
  if (val < 0) {
    return `${name} no puede ser negativo.`;
  }
  return null;
}

function calcZfromRX(R, X) {
  const errR = validateImpedanceParam(R, "Resistencia (R)");
  if (errR) return { value: null, error: errR };
  const errX = validateImpedanceParam(X, "Reactancia (X)");
  if (errX) return { value: null, error: errX };

  return { value: Math.sqrt(R ** 2 + X ** 2), error: null };
}

function calcRfromZX(Z, X) {
  const errZ = validateImpedanceParam(Z, "Impedancia (Z)");
  if (errZ) return { value: null, error: errZ };
  const errX = validateImpedanceParam(X, "Reactancia (X)");
  if (errX) return { value: null, error: errX };
  if (X > Z) return { value: null, error: "X no puede ser mayor que Z." };

  return { value: Math.sqrt(Z ** 2 - X ** 2), error: null };
}

function calcXfromZR(Z, R) {
  const errZ = validateImpedanceParam(Z, "Impedancia (Z)");
  if (errZ) return { value: null, error: errZ };
  const errR = validateImpedanceParam(R, "Resistencia (R)");
  if (errR) return { value: null, error: errR };
  if (R > Z) return { value: null, error: "R no puede ser mayor que Z." };

  return { value: Math.sqrt(Z ** 2 - R ** 2), error: null };
}

function calcPhaseAngle(R, X) {
  const errR = validateImpedanceParam(R, "Resistencia (R)");
  if (errR) return { value: null, error: errR };
  const errX = validateImpedanceParam(X, "Reactancia (X)");
  if (errX) return { value: null, error: errX };
  if (R === 0 && X === 0) return { value: null, error: "R y X no pueden ser ambos cero." };

  return { value: (Math.atan2(X, R) * 180) / Math.PI, error: null };
}

function calcAllFromRX(R, X) {
  const Z = calcZfromRX(R, X);
  if (Z.error) return { values: null, error: Z.error };
  const phi = calcPhaseAngle(R, X);
  if (phi.error) return { values: null, error: phi.error };

  return {
    values: {
      Z: Z.value,
      R,
      X,
      phi: phi.value,
    },
    error: null,
  };
}

/**
 * Módulo Delta / Estrella
 * Conversión de tensiones y corrientes de fase ↔ línea
 */

export function deltaStarCalculator({ mode, Vline, Vphase, Iline, Iphase }) {
  // ESTRELLA: V_linea = √3 × V_fase, I_linea = I_fase
  if (mode === "star_VlineFromVphase") {
    return calcStarVlineFromVphase(Vphase);
  }
  if (mode === "star_VphaseFromVline") {
    return calcStarVphaseFromVline(Vline);
  }
  if (mode === "star_IlineFromIphase") {
    // En estrella la corriente de línea ES la de fase
    return calcStarIlineFromIphase(Iphase);
  }
  if (mode === "star_IphaseFromIline") {
    return calcStarIphaseFromIline(Iline);
  }

  // DELTA: V_linea = V_fase, I_linea = √3 × I_fase
  if (mode === "delta_VlineFromVphase") {
    return calcDeltaVlineFromVphase(Vphase);
  }
  if (mode === "delta_VphaseFromVline") {
    return calcDeltaVphaseFromVline(Vline);
  }
  if (mode === "delta_IlineFromIphase") {
    return calcDeltaIlineFromIphase(Iphase);
  }
  if (mode === "delta_IphaseFromIline") {
    return calcDeltaIphaseFromIline(Iline);
  }

  return null;
}

function validatePositive(val, name) {
  if (typeof val !== "number" || !isFinite(val)) {
    return `${name} debe ser un número finito.`;
  }
  if (val <= 0) {
    return `${name} debe ser mayor a cero.`;
  }
  return null;
}

// ESTRELLA
function calcStarVlineFromVphase(Vphase) {
  const err = validatePositive(Vphase, "Tensión de fase");
  if (err) return { value: null, error: err };
  return { value: Vphase * Math.sqrt(3), error: null };
}

function calcStarVphaseFromVline(Vline) {
  const err = validatePositive(Vline, "Tensión de línea");
  if (err) return { value: null, error: err };
  return { value: Vline / Math.sqrt(3), error: null };
}

function calcStarIlineFromIphase(Iphase) {
  const err = validatePositive(Iphase, "Corriente de fase");
  if (err) return { value: null, error: err };
  return { value: Iphase, error: null, note: "En estrella I_línea = I_fase" };
}

function calcStarIphaseFromIline(Iline) {
  const err = validatePositive(Iline, "Corriente de línea");
  if (err) return { value: null, error: err };
  return { value: Iline, error: null, note: "En estrella I_fase = I_línea" };
}

// DELTA
function calcDeltaVlineFromVphase(Vphase) {
  const err = validatePositive(Vphase, "Tensión de fase");
  if (err) return { value: null, error: err };
  return { value: Vphase, error: null, note: "En delta V_línea = V_fase" };
}

function calcDeltaVphaseFromVline(Vline) {
  const err = validatePositive(Vline, "Tensión de línea");
  if (err) return { value: null, error: err };
  return { value: Vline, error: null, note: "En delta V_fase = V_línea" };
}

function calcDeltaIlineFromIphase(Iphase) {
  const err = validatePositive(Iphase, "Corriente de fase");
  if (err) return { value: null, error: err };
  return { value: Iphase * Math.sqrt(3), error: null };
}

function calcDeltaIphaseFromIline(Iline) {
  const err = validatePositive(Iline, "Corriente de línea");
  if (err) return { value: null, error: err };
  return { value: Iline / Math.sqrt(3), error: null };
}

/**
 * Módulo CD (Corriente Directa)
 * Ley de Ohm pura: V = I × R, P = V × I
 */

export function dcCalculator({ mode, voltage, current, resistance, power }) {
  if (mode === "dc_voltage") {
    return calcDCVoltage(current, resistance);
  }
  if (mode === "dc_current") {
    return calcDCCurrent(voltage, resistance);
  }
  if (mode === "dc_resistance") {
    return calcDCResistance(voltage, current);
  }
  if (mode === "dc_power") {
    return calcDCPower(voltage, current);
  }
  if (mode === "dc_currentFromPowerV") {
    return calcDCCurrentFromPowerV(power, voltage);
  }
  if (mode === "dc_voltageFromPowerI") {
    return calcDCVoltageFromPowerI(power, current);
  }
  return null;
}

function validateDC(val, name, allowZero = false) {
  if (typeof val !== "number" || !isFinite(val)) {
    return `${name} debe ser un número finito.`;
  }
  if (!allowZero && val <= 0) {
    return `${name} debe ser mayor a cero.`;
  }
  if (allowZero && val < 0) {
    return `${name} no puede ser negativo.`;
  }
  return null;
}

function calcDCVoltage(current, resistance) {
  const errI = validateDC(current, "Corriente");
  if (errI) return { value: null, error: errI };
  const errR = validateDC(resistance, "Resistencia");
  if (errR) return { value: null, error: errR };
  return { value: current * resistance, error: null };
}

function calcDCCurrent(voltage, resistance) {
  const errV = validateDC(voltage, "Voltaje");
  if (errV) return { value: null, error: errV };
  const errR = validateDC(resistance, "Resistencia");
  if (errR) return { value: null, error: errR };
  return { value: voltage / resistance, error: null };
}

function calcDCResistance(voltage, current) {
  const errV = validateDC(voltage, "Voltaje");
  if (errV) return { value: null, error: errV };
  const errI = validateDC(current, "Corriente");
  if (errI) return { value: null, error: errI };
  return { value: voltage / current, error: null };
}

function calcDCPower(voltage, current) {
  const errV = validateDC(voltage, "Voltaje", true);
  if (errV) return { value: null, error: errV };
  const errI = validateDC(current, "Corriente", true);
  if (errI) return { value: null, error: errI };
  return { value: voltage * current, error: null };
}

function calcDCCurrentFromPowerV(power, voltage) {
  const errP = validateDC(power, "Potencia", true);
  if (errP) return { value: null, error: errP };
  const errV = validateDC(voltage, "Voltaje");
  if (errV) return { value: null, error: errV };
  return { value: power / voltage, error: null };
}

function calcDCVoltageFromPowerI(power, current) {
  const errP = validateDC(power, "Potencia", true);
  if (errP) return { value: null, error: errP };
  const errI = validateDC(current, "Corriente");
  if (errI) return { value: null, error: errI };
  return { value: power / current, error: null };
}