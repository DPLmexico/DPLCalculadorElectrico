export function electriCalculator({ system, mode, voltage, current, apparentPower, activePower, powerFactor }) {
  if (system === "mono") {
    if (mode === "apparentPower") {
        return singlePhasePower(voltage, current);
    }
    if (mode === "activePower") {
        return calculatePower({
            mode,
            apparentPower,
            activePower,
            powerFactor
        });
        }
    if (mode === "CurrentFromActivePowerPF") {
        const result = calculateAparentPower(activePower, powerFactor);
        if (result.error) {
            return result;
        }
        return singlePhaseCurrent(result.value, voltage);
    }

    if (mode === "current") {
        return singlePhaseCurrent(apparentPower, voltage);
    }
    if (mode === "voltage") {
        return singlePhaseVoltage(apparentPower, current);
    }
  }

  if (system === "tri") {
    if (mode === "apparentPower") {
        return threePhasePower(voltage, current);
    }
    if (mode === "activePower") {
        return calculatePower({
            mode,
            apparentPower,
            activePower,
            powerFactor
        });
        }
    if (mode === "CurrentFromActivePowerPF") {
        const result = calculateAparentPower(activePower, powerFactor);
        if (result.error) {
            return result;
        }
        return threePhaseCurrent(result.value, voltage);
    }
    if (mode === "current") {
        return threePhaseCurrent(apparentPower, voltage);
    }
    if (mode === "voltage") {
        return threePhaseVoltage(apparentPower, current);
    }
  }

  return null;
}

export function calculatePower({ mode, apparentPower, activePower, powerFactor }) {
    if (mode === "apparentPower" || mode === "CurrentFromActivePowerPF") {
        return { val1: calculateAparentPower(activePower, powerFactor), val2: calculateReactivePower(activePower/powerFactor , activePower) };
    }
    if (mode === "activePower") {
        return calculateActivePower(apparentPower, powerFactor);
    }
    if (mode === "powerFactor") {
        return calculatePowerFactor(activePower, apparentPower);
    }
    if (mode === "reactivePower") {
        const reactive = calculateReactivePower(apparentPower, activePower);

        if (reactive.error) {
            return reactive;
        }

        const pf = calculatePowerFactor(activePower, apparentPower);

        if (pf.error) {
            return pf;
        }

        return {
            value: {
                val1: reactive.value,
                val2: pf.value
            },
            error: null
        };
    }
    if (mode == "reactiveFromActivePF") {
        const reactive = calculateReactivePowerFromActivePF( activePower, powerFactor);

        if (reactive.error) {
            return reactive;
        }

        const apparent = calculateAparentPower( activePower, powerFactor );

        if (apparent.error) {
            return apparent
        }

        return {
            value: {
                val1: reactive.value,
                val2: apparent.value
            },
            error: null
        }
    }

    return null;
}

/*
 * Funciones principales para cálculos eléctricos básicos, incluyendo Ohm y potencia para sistemas monofásicos y trifásicos, con validación de entradas.
 * Calculo de corriente trifasica a partir de potencia aparente y voltaje.
*/
function threePhaseCurrent(apparentPower, voltage) {
    if (typeof apparentPower !== "number" || typeof voltage !== "number") {
        return { value: null, error: "Los parámetros deben ser números." };
    }
    if (!isFinite(apparentPower) || !isFinite(voltage)) {
        return { value: null, error: "Los parámetros deben ser números finitos." };
    }
    if (voltage <= 0) {
        return { value: null, error: "El voltaje debe ser mayor a cero." };
    }
    if (apparentPower < 0) {
        return { value: null, error: "La potencia aparente no puede ser negativa." };
    }

    return { value: apparentPower / (voltage * Math.sqrt(3)), error: null };
}

// Calculo de corriente monofasica a partir de potencia aparente y voltaje.
function singlePhaseCurrent(apparentPower, voltage) {
    if (typeof apparentPower !== "number" || typeof voltage !== "number") {
        return { value: null, error: "Los parámetros deben ser números." };
    }
    if (!isFinite(apparentPower) || !isFinite(voltage)) {
        return { value: null, error: "Los parámetros deben ser números finitos." };
    }
    if (voltage <= 0) {
        return { value: null, error: "El voltaje debe ser mayor a cero." };
    }
    if (apparentPower < 0) {
        return { value: null, error: "La potencia aparente no puede ser negativa." };
    }
    return { value: apparentPower / voltage, error: null };
}

// Calculo de potencia trifasica.
function threePhasePower(voltage, current) {
    if (typeof voltage !== "number" || typeof current !== "number") {
        return { value: null, error: "Los parámetros deben ser números." };
    }
    if (!isFinite(voltage) || !isFinite(current)) {
        return { value: null, error: "Los parámetros deben ser números finitos." };
    }
    if (voltage <= 0) {
        return { value: null, error: "El voltaje debe ser mayor a cero." };
    }
    if (current < 0) {
        return { value: null, error: "La corriente no puede ser negativa." };
    }
    return { value: voltage * current * Math.sqrt(3), error: null };
}

// Calculo de potencia monofasica.
function singlePhasePower(voltage, current) {
    if (typeof voltage !== "number" || typeof current !== "number") {
        return { value: null, error: "Los parámetros deben ser números." };
    }
    if (!isFinite(voltage) || !isFinite(current)) {
        return { value: null, error: "Los parámetros deben ser números finitos." };
    }
    if (voltage <= 0) {
        return { value: null, error: "El voltaje debe ser mayor a cero." };
    }
    if (current < 0) {
        return { value: null, error: "La corriente no puede ser negativa." };
    }
    return { value: voltage * current, error: null };
}

//Calculo de voltaje trifasico a partir de potencia aparente y corriente.
function threePhaseVoltage(apparentPower, current) {
    if (typeof apparentPower !== "number" || typeof current !== "number") {
        return { value: null, error: "Los parámetros deben ser números." };
    }
    if (!isFinite(apparentPower) || !isFinite(current)) {
        return { value: null, error: "Los parámetros deben ser números finitos." };
    }
    if (current <= 0) {
        return { value: null, error: "La corriente debe ser mayor a cero." };
    }
    if (apparentPower < 0) {
        return { value: null, error: "La potencia aparente no puede ser negativa." };
    }
    return { value: apparentPower / (current * Math.sqrt(3)), error: null };
}

//Calculo de voltaje monofasico a partir de potencia aparente y corriente.
function singlePhaseVoltage(apparentPower, current) {
    if (typeof apparentPower !== "number" || typeof current !== "number") {
        return { value: null, error: "Los parámetros deben ser números." };
    }
    if (!isFinite(apparentPower) || !isFinite(current)) {
        return { value: null, error: "Los parámetros deben ser números finitos." };
    }
    if (current <= 0) {
        return { value: null, error: "La corriente debe ser mayor a cero." };
    }
    if (apparentPower < 0) {
        return { value: null, error: "La potencia aparente no puede ser negativa." };
    }
    return { value: apparentPower / current, error: null };
}

/*
 * Calculo de potencias puras activa, reactiva y aparente a partir de ángulo de fase, potencia aparente y potencia activa.
*/

function calculateAparentPower(activePower, powerFactor) {
    if (typeof activePower !== "number" || typeof powerFactor !== "number") {
        return { value: null, error: "Los parámetros deben ser números." };
    }
    if (!isFinite(activePower) || !isFinite(powerFactor)) {
        return { value: null, error: "Los parámetros deben ser números finitos." };
    } 
    if (activePower < 0) {
        return { value: null, error: "La potencia activa no puede ser negativa." };
    }
    if (powerFactor <= 0 || powerFactor > 1) {
        return { value: null, error: "El factor de potencia debe estar entre 0 y 1." };
    }
    return { value: activePower / powerFactor, error: null };
}

function calculateActivePower(apparentPower, powerFactor) {
    if (typeof apparentPower !== "number" || typeof powerFactor !== "number") {
        return { value: null, error: "Los parámetros deben ser números." };
    }
    if (!isFinite(apparentPower) || !isFinite(powerFactor)) {
        return { value: null, error: "Los parámetros deben ser números finitos." };
    }
    if (apparentPower < 0) {
        return { value: null, error: "La potencia aparente no puede ser negativa." };
    }
    if (powerFactor <= 0 || powerFactor > 1) {
        return { value: null, error: "El factor de potencia debe estar entre 0 y 1." };
    }
    return { value: apparentPower * powerFactor, error: null };
}

function calculatePowerFactor(activePower, apparentPower) {
    if (typeof activePower !== "number" || typeof apparentPower !== "number") {
        return { value: null, error: "Los parámetros deben ser números." };
    }
    if (!isFinite(activePower) || !isFinite(apparentPower)) {
        return { value: null, error: "Los parámetros deben ser números finitos." };
    }
    if (activePower < 0) {
        return { value: null, error: "La potencia activa no puede ser negativa." };
    }
    if (apparentPower < 0) {
        return { value: null, error: "La potencia aparente no puede ser negativa." };
    }
    if (apparentPower === 0) {
        return { value: null, error: "La potencia aparente no puede ser cero." };
    }
    if (apparentPower < activePower) {
        return { value: null, error: "La potencia aparente no puede ser menor que la potencia activa" };
    }
    return { value: activePower / apparentPower, error: null };
}

function calculateReactivePower(apparentPower, activePower) {
    if (typeof apparentPower !== "number" || typeof activePower !== "number") {
        return { value: null, error: "Los parámetros deben ser números." };
    }
    if (!isFinite(apparentPower) || !isFinite(activePower)) {
        return { value: null, error: "Los parámetros deben ser números finitos." };
    }
    if (apparentPower < 0) {
        return { value: null, error: "La potencia aparente no puede ser negativa." };
    }
    if (activePower < 0) {
        return { value: null, error: "La potencia activa no puede ser negativa." };
    }
    if (apparentPower === 0) {
        return { value: null, error: "La potencia aparente no puede ser cero." };
    }
    if (apparentPower < activePower) {
        return { value: null, error: "La potencia aparente no puede ser menor que la potencia activa." };
    }
    return { value: Math.sqrt(apparentPower ** 2 - activePower ** 2), error: null };
}

function calculateReactivePowerFromActivePF(activePower, powerFactor) {
    if (typeof activePower !== "number" || typeof powerFactor !== "number") {
        return { value: null, error: "Los parámetros deben ser números." };
    }
    if (!isFinite(activePower) || !isFinite(powerFactor)) {
        return { value: null, error: "Los parámetros deben ser números finitos." };
    }
    if (activePower < 0) {
        return { value: null, error: "La potencia activa no puede ser negativa." };
    }
    if ( powerFactor <= 0 || powerFactor > 1 ) {
        return { value: null, error: "El factor de potencia no puede ser menor 0, ni mayor que 1." };
    }
    const apparentPower1 = activePower / powerFactor
    return { value: Math.sqrt(apparentPower1 ** 2 - activePower ** 2), error: null };
}
