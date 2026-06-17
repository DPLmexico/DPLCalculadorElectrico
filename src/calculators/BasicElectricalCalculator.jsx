/**
 * BasicElectricalCalculator.jsx
 * Módulos: CA Básico | Impedancia | Delta/Estrella | CD
 * Historial en sesión con exportación CSV y PDF (jsPDF)
 *
 * Dependencias externas requeridas:
 *   npm install jspdf
 *
 * Imports de lógica (ajustar rutas según estructura del proyecto):
 *   import { electriCalculator, calculatePower } from "../logic/basicElectrical";
 *   import { impedanceCalculator, deltaStarCalculator, dcCalculator } from "../logic/impedance";
 */

import { useState, useCallback } from "react";
import { electriCalculator, calculatePower } from "../logic/basicElectrical";
import { impedanceCalculator, deltaStarCalculator, dcCalculator } from "../logic/impedance";

// ─── Constantes de configuración ────────────────────────────────────────────

const MODULES = {
  ac: "CA Básico",
  impedance: "Impedancia",
  deltaStar: "Delta / Estrella",
  dc: "CD",
};

const AC_MODES = [
  { value: "voltage", label: "Voltaje" },
  { value: "current", label: "Corriente" },
  { value: "apparentPower", label: "Potencia Aparente" },
  { value: "activePower", label: "Potencia Activa" },
  { value: "reactivePower", label: "Potencia Reactiva" },
  { value: "CurrentFromActivePowerPF", label: "Corriente (P + FP)" },
];

const IMPEDANCE_MODES = [
  { value: "allFromRX", label: "Z, φ desde R y X" },
  { value: "RfromZX", label: "R desde Z y X" },
  { value: "XfromZR", label: "X desde Z y R" },
];

const DELTA_STAR_MODES = [
  { value: "star_VlineFromVphase", label: "⭐ Estrella: V_línea desde V_fase" },
  { value: "star_VphaseFromVline", label: "⭐ Estrella: V_fase desde V_línea" },
  { value: "star_IlineFromIphase", label: "⭐ Estrella: I_línea desde I_fase" },
  { value: "star_IphaseFromIline", label: "⭐ Estrella: I_fase desde I_línea" },
  { value: "delta_VlineFromVphase", label: "△ Delta: V_línea desde V_fase" },
  { value: "delta_VphaseFromVline", label: "△ Delta: V_fase desde V_línea" },
  { value: "delta_IlineFromIphase", label: "△ Delta: I_línea desde I_fase" },
  { value: "delta_IphaseFromIline", label: "△ Delta: I_fase desde I_línea" },
];

const DC_MODES = [
  { value: "dc_voltage", label: "Voltaje (V = I × R)" },
  { value: "dc_current", label: "Corriente (I = V / R)" },
  { value: "dc_resistance", label: "Resistencia (R = V / I)" },
  { value: "dc_power", label: "Potencia (P = V × I)" },
  { value: "dc_currentFromPowerV", label: "Corriente (I = P / V)" },
  { value: "dc_voltageFromPowerI", label: "Voltaje (V = P / I)" },
];

// ─── Helpers de exportación ──────────────────────────────────────────────────

function exportCSV(history) {
  if (!history.length) return;
  const header = ["Fecha", "Módulo", "Modo", "Entradas", "Resultado"].join(",");
  const rows = history.map((h) => [
    `"${h.timestamp}"`,
    `"${h.module}"`,
    `"${h.mode}"`,
    `"${h.inputs}"`,
    `"${h.result}"`,
  ].join(","));
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dpl_calculos_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportPDF(history) {
  if (!history.length) return;
  // Importación dinámica para no cargar jsPDF si no se usa
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });

  // Encabezado
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, 216, 30, "F");
  doc.setTextColor(0, 232, 122);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("DPL México — Historial de Cálculos", 14, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text(`Generado: ${new Date().toLocaleString("es-MX")}`, 14, 22);

  let y = 38;
  const lineH = 7;
  const pageH = 270;

  history.forEach((h, idx) => {
    if (y + 28 > pageH) {
      doc.addPage();
      y = 14;
    }

    // Fondo de tarjeta
    doc.setFillColor(20, 20, 20);
    doc.roundedRect(10, y - 2, 196, 26, 2, 2, "F");

    // Número e índice
    doc.setTextColor(0, 232, 122);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(`#${String(idx + 1).padStart(2, "0")}`, 14, y + 5);

    // Módulo y modo
    doc.setTextColor(220, 220, 220);
    doc.setFontSize(9);
    doc.text(`${h.module} — ${h.mode}`, 28, y + 5);

    // Timestamp
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(7);
    doc.text(h.timestamp, 160, y + 5);

    // Entradas
    doc.setTextColor(160, 160, 160);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const inputsText = doc.splitTextToSize(`Entradas: ${h.inputs}`, 180);
    doc.text(inputsText, 14, y + 12);

    // Resultado
    doc.setTextColor(0, 232, 122);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`→ ${h.result}`, 14, y + 21);

    y += 30;
  });

  doc.save(`dpl_calculos_${Date.now()}.pdf`);
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function BasicElectricalCalculator() {
  const [activeModule, setActiveModule] = useState("ac");
  const [history, setHistory] = useState([]);

  // ── Estado AC ──
  const [acSystem, setAcSystem] = useState("tri");
  const [acMode, setAcMode] = useState("current");
  const [voltage, setVoltage] = useState(220);
  const [current, setCurrent] = useState(10);
  const [apparentPower, setApparentPower] = useState(500);
  const [activePower, setActivePower] = useState(900);
  const [reactivePower, setReactivePower] = useState(400);
  const [powerFactor, setPowerFactor] = useState(0.9);

  // ── Estado Impedancia ──
  const [impMode, setImpMode] = useState("allFromRX");
  const [impZ, setImpZ] = useState(10);
  const [impR, setImpR] = useState(8);
  const [impX, setImpX] = useState(6);

  // ── Estado Delta/Estrella ──
  const [dsMode, setDsMode] = useState("star_VlineFromVphase");
  const [dsVline, setDsVline] = useState(440);
  const [dsVphase, setDsVphase] = useState(254);
  const [dsIline, setDsIline] = useState(20);
  const [dsIphase, setDsIphase] = useState(20);

  // ── Estado CD ──
  const [dcMode, setDcMode] = useState("dc_voltage");
  const [dcVoltage, setDcVoltage] = useState(24);
  const [dcCurrent, setDcCurrent] = useState(5);
  const [dcResistance, setDcResistance] = useState(4.8);
  const [dcPower, setDcPower] = useState(120);

  // ─── Cálculos activos ───────────────────────────────────────────────────

  const acResult = electriCalculator({
    system: acSystem,
    mode: acMode,
    voltage,
    current,
    apparentPower,
    activePower,
    powerFactor,
  });

  const powerResult = calculatePower({
    mode: acMode,
    apparentPower,
    activePower,
    reactivePower,
    powerFactor,
  });

  const impResult = impedanceCalculator({
    mode: impMode,
    Z: impZ,
    R: impR,
    X: impX,
  });

  const dsResult = deltaStarCalculator({
    mode: dsMode,
    Vline: dsVline,
    Vphase: dsVphase,
    Iline: dsIline,
    Iphase: dsIphase,
  });

  const dcResult = dcCalculator({
    mode: dcMode,
    voltage: dcVoltage,
    current: dcCurrent,
    resistance: dcResistance,
    power: dcPower,
  });

  // ─── Guardar en historial ───────────────────────────────────────────────

  const addToHistory = useCallback(() => {
    const now = new Date().toLocaleString("es-MX");

    let entry = null;

    if (activeModule === "ac") {
      const modeLabel = AC_MODES.find((m) => m.value === acMode)?.label || acMode;
      let inputs = "";
      let result = "";

      if (acMode === "current") inputs = `V=${voltage}V, S=${apparentPower}VA`;
      else if (acMode === "voltage") inputs = `I=${current}A, S=${apparentPower}VA`;
      else if (acMode === "apparentPower") inputs = `V=${voltage}V, I=${current}A`;
      else if (acMode === "activePower") inputs = `S=${apparentPower}VA, FP=${powerFactor}`;
      else if (acMode === "reactivePower") inputs = `S=${apparentPower}VA, P=${activePower}W`;
      else if (acMode === "CurrentFromActivePowerPF") inputs = `V=${voltage}V, P=${activePower}W, FP=${powerFactor}`;

      const val = acResult?.value;
      if (Number.isFinite(val)) {
        const units = { voltage: "V", current: "A", apparentPower: "VA", activePower: "W", CurrentFromActivePowerPF: "A" };
        result = `${val.toFixed(3)} ${units[acMode] || ""}`;
      } else {
        result = acResult?.error || "Error";
      }

      entry = {
        timestamp: now,
        module: `CA ${acSystem === "tri" ? "Trifásico" : "Monofásico"}`,
        mode: modeLabel,
        inputs,
        result,
      };
    }

    if (activeModule === "impedance") {
      const modeLabel = IMPEDANCE_MODES.find((m) => m.value === impMode)?.label || impMode;
      let inputs = "";
      let result = "";

      if (impMode === "allFromRX") {
        inputs = `R=${impR}Ω, X=${impX}Ω`;
        const v = impResult?.values;
        result = v ? `Z=${v.Z.toFixed(3)}Ω, φ=${v.phi.toFixed(2)}°` : impResult?.error || "Error";
      } else if (impMode === "RfromZX") {
        inputs = `Z=${impZ}Ω, X=${impX}Ω`;
        result = Number.isFinite(impResult?.value) ? `${impResult.value.toFixed(3)} Ω` : impResult?.error || "Error";
      } else if (impMode === "XfromZR") {
        inputs = `Z=${impZ}Ω, R=${impR}Ω`;
        result = Number.isFinite(impResult?.value) ? `${impResult.value.toFixed(3)} Ω` : impResult?.error || "Error";
      }

      entry = { timestamp: now, module: "Impedancia", mode: modeLabel, inputs, result };
    }

    if (activeModule === "deltaStar") {
      const modeLabel = DELTA_STAR_MODES.find((m) => m.value === dsMode)?.label || dsMode;
      const topology = dsMode.startsWith("star") ? "Estrella" : "Delta";
      let inputs = "";
      let result = "";

      if (dsMode.includes("Vline")) inputs = `V_línea=${dsVline}V`;
      else if (dsMode.includes("Vphase")) inputs = `V_fase=${dsVphase}V`;
      else if (dsMode.includes("Iline")) inputs = `I_línea=${dsIline}A`;
      else if (dsMode.includes("Iphase")) inputs = `I_fase=${dsIphase}A`;

      const u = dsMode.includes("_V") ? "V" : "A";
      result = Number.isFinite(dsResult?.value)
        ? `${dsResult.value.toFixed(3)} ${u}${dsResult.note ? ` (${dsResult.note})` : ""}`
        : dsResult?.error || "Error";

      entry = { timestamp: now, module: topology, mode: modeLabel, inputs, result };
    }

    if (activeModule === "dc") {
      const modeLabel = DC_MODES.find((m) => m.value === dcMode)?.label || dcMode;
      const inputMap = {
        dc_voltage: `I=${dcCurrent}A, R=${dcResistance}Ω`,
        dc_current: `V=${dcVoltage}V, R=${dcResistance}Ω`,
        dc_resistance: `V=${dcVoltage}V, I=${dcCurrent}A`,
        dc_power: `V=${dcVoltage}V, I=${dcCurrent}A`,
        dc_currentFromPowerV: `P=${dcPower}W, V=${dcVoltage}V`,
        dc_voltageFromPowerI: `P=${dcPower}W, I=${dcCurrent}A`,
      };
      const unitMap = {
        dc_voltage: "V", dc_current: "A", dc_resistance: "Ω",
        dc_power: "W", dc_currentFromPowerV: "A", dc_voltageFromPowerI: "V",
      };
      const result = Number.isFinite(dcResult?.value)
        ? `${dcResult.value.toFixed(3)} ${unitMap[dcMode]}`
        : dcResult?.error || "Error";

      entry = { timestamp: now, module: "CD", mode: modeLabel, inputs: inputMap[dcMode] || "", result };
    }

    if (entry) {
      setHistory((prev) => [entry, ...prev]);
    }
  }, [activeModule, acMode, acSystem, voltage, current, apparentPower, activePower, reactivePower, powerFactor,
      acResult, impMode, impR, impX, impZ, impResult, dsMode, dsVline, dsVphase, dsIline, dsIphase, dsResult,
      dcMode, dcVoltage, dcCurrent, dcResistance, dcPower, dcResult]);

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black p-4 font-body text-text-base md:p-6">
      <div className="mx-auto max-w-3xl space-y-4">

        {/* Header */}
        <div className="rounded-xl border border-border-custom bg-surface p-5">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-green">
            DPL ElectriCalc
          </h1>
          <p className="mt-1 text-sm text-text-muted">Calculadora Eléctrica Básica — v1.0</p>
        </div>

        {/* Selector de módulo */}
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(MODULES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveModule(key)}
              className={`rounded-lg border px-3 py-2 font-display text-xs font-semibold uppercase tracking-wider transition
                ${activeModule === key
                  ? "border-green bg-green/10 text-green"
                  : "border-border-custom bg-surface text-text-muted hover:border-green-dim hover:text-text-base"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Panel de cálculo */}
        <div className="rounded-xl border border-border-custom bg-surface p-5">

          {/* ── Módulo CA ── */}
          {activeModule === "ac" && (
            <ACModule
              system={acSystem} setSystem={setAcSystem}
              mode={acMode} setMode={setAcMode}
              voltage={voltage} setVoltage={setVoltage}
              current={current} setCurrent={setCurrent}
              apparentPower={apparentPower} setApparentPower={setApparentPower}
              activePower={activePower} setActivePower={setActivePower}
              reactivePower={reactivePower} setReactivePower={setReactivePower}
              powerFactor={powerFactor} setPowerFactor={setPowerFactor}
              acResult={acResult}
              powerResult={powerResult}
            />
          )}

          {/* ── Módulo Impedancia ── */}
          {activeModule === "impedance" && (
            <ImpedanceModule
              mode={impMode} setMode={setImpMode}
              Z={impZ} setZ={setImpZ}
              R={impR} setR={setImpR}
              X={impX} setX={setImpX}
              result={impResult}
            />
          )}

          {/* ── Módulo Delta/Estrella ── */}
          {activeModule === "deltaStar" && (
            <DeltaStarModule
              mode={dsMode} setMode={setDsMode}
              Vline={dsVline} setVline={setDsVline}
              Vphase={dsVphase} setVphase={setDsVphase}
              Iline={dsIline} setIline={setDsIline}
              Iphase={dsIphase} setIphase={setDsIphase}
              result={dsResult}
            />
          )}

          {/* ── Módulo CD ── */}
          {activeModule === "dc" && (
            <DCModule
              mode={dcMode} setMode={setDcMode}
              voltage={dcVoltage} setVoltage={setDcVoltage}
              current={dcCurrent} setCurrent={setDcCurrent}
              resistance={dcResistance} setResistance={setDcResistance}
              power={dcPower} setPower={setDcPower}
              result={dcResult}
            />
          )}

          {/* Botón guardar */}
          <button
            onClick={addToHistory}
            className="mt-5 w-full rounded-lg border border-green bg-green/10 py-2 font-display text-sm font-semibold uppercase tracking-wider text-green transition hover:bg-green/20"
          >
            + Guardar en historial
          </button>
        </div>

        {/* Historial */}
        {history.length > 0 && (
          <HistoryPanel
            history={history}
            onClear={() => setHistory([])}
            onExportCSV={() => exportCSV(history)}
            onExportPDF={() => exportPDF(history)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Sub-módulos ─────────────────────────────────────────────────────────────

function ACModule({ system, setSystem, mode, setMode, voltage, setVoltage, current, setCurrent,
  apparentPower, setApparentPower, activePower, setActivePower, reactivePower, setReactivePower,
  powerFactor, setPowerFactor, acResult, powerResult }) {

  const acModes = {
    voltage: { title: "Voltaje", unit: "V" },
    current: { title: "Corriente", unit: "A" },
    apparentPower: { title: "Potencia Aparente", unit: "VA" },
    activePower: { title: "Potencia Activa", unit: "W" },
    CurrentFromActivePowerPF: { title: "Corriente", unit: "A" },
  };

  return (
    <div className="space-y-5">
      <SectionLabel>Sistema CA</SectionLabel>
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Sistema" value={system} onChange={setSystem}>
          <option value="mono">Monofásico</option>
          <option value="tri">Trifásico</option>
        </SelectField>
        <SelectField label="Calcular" value={mode} onChange={setMode}>
          {AC_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </SelectField>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {mode === "voltage" && (<>
          <NumberInput label="Corriente" value={current} onChange={setCurrent} unit="A" />
          <NumberInput label="Potencia Aparente" value={apparentPower} onChange={setApparentPower} unit="VA" />
        </>)}
        {mode === "current" && (<>
          <NumberInput label="Voltaje" value={voltage} onChange={setVoltage} unit="V" />
          <NumberInput label="Potencia Aparente" value={apparentPower} onChange={setApparentPower} unit="VA" />
        </>)}
        {mode === "apparentPower" && (<>
          <NumberInput label="Voltaje" value={voltage} onChange={setVoltage} unit="V" />
          <NumberInput label="Corriente" value={current} onChange={setCurrent} unit="A" />
        </>)}
        {mode === "activePower" && (<>
          <NumberInput label="Potencia Aparente" value={apparentPower} onChange={setApparentPower} unit="VA" />
          <NumberInput label="Factor de Potencia" value={powerFactor} onChange={setPowerFactor} unit="" min={0.01} max={1} step={0.01} />
        </>)}
        {mode === "reactivePower" && (<>
          <NumberInput label="Potencia Aparente" value={apparentPower} onChange={setApparentPower} unit="VA" />
          <NumberInput label="Potencia Activa" value={activePower} onChange={setActivePower} unit="W" />
        </>)}
        {mode === "CurrentFromActivePowerPF" && (<>
          <NumberInput label="Voltaje" value={voltage} onChange={setVoltage} unit="V" />
          <NumberInput label="Potencia Activa" value={activePower} onChange={setActivePower} unit="W" />
          <NumberInput label="Factor de Potencia" value={powerFactor} onChange={setPowerFactor} unit="" min={0.01} max={1} step={0.01} />
        </>)}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {acModes[mode] && (
          <ResultCard title={acModes[mode].title} value={acResult?.value} unit={acModes[mode].unit} />
        )}
        {mode === "CurrentFromActivePowerPF" && (<>
          <ResultCard title="Potencia Aparente" value={powerResult?.val1?.value} unit="VA" />
          <ResultCard title="Potencia Reactiva" value={powerResult?.val2?.value} unit="VAR" />
        </>)}
        {mode === "reactivePower" && (<>
          <ResultCard title="Potencia Reactiva" value={powerResult?.value?.val1} unit="VAR" />
          <ResultCard title="Factor de Potencia" value={powerResult?.value?.val2} unit="" />
        </>)}
        <ErrorCard error={acResult?.error || powerResult?.error} />
      </div>
    </div>
  );
}

function ImpedanceModule({ mode, setMode, Z, setZ, R, setR, X, setX, result }) {
  return (
    <div className="space-y-5">
      <SectionLabel>Impedancia</SectionLabel>
      <SelectField label="Calcular" value={mode} onChange={setMode}>
        {IMPEDANCE_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
      </SelectField>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {(mode === "allFromRX") && (<>
          <NumberInput label="Resistencia R" value={R} onChange={setR} unit="Ω" />
          <NumberInput label="Reactancia X" value={X} onChange={setX} unit="Ω" />
        </>)}
        {mode === "RfromZX" && (<>
          <NumberInput label="Impedancia Z" value={Z} onChange={setZ} unit="Ω" />
          <NumberInput label="Reactancia X" value={X} onChange={setX} unit="Ω" />
        </>)}
        {mode === "XfromZR" && (<>
          <NumberInput label="Impedancia Z" value={Z} onChange={setZ} unit="Ω" />
          <NumberInput label="Resistencia R" value={R} onChange={setR} unit="Ω" />
        </>)}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {mode === "allFromRX" && result?.values && (<>
          <ResultCard title="Impedancia Z" value={result.values.Z} unit="Ω" />
          <ResultCard title="Resistencia R" value={result.values.R} unit="Ω" />
          <ResultCard title="Reactancia X" value={result.values.X} unit="Ω" />
          <ResultCard title="Ángulo de fase φ" value={result.values.phi} unit="°" />
        </>)}
        {(mode === "RfromZX" || mode === "XfromZR") && (
          <ResultCard
            title={mode === "RfromZX" ? "Resistencia R" : "Reactancia X"}
            value={result?.value}
            unit="Ω"
          />
        )}
        <ErrorCard error={result?.error} />
      </div>
    </div>
  );
}

function DeltaStarModule({ mode, setMode, Vline, setVline, Vphase, setVphase, Iline, setIline, Iphase, setIphase, result }) {
  const isVline = mode.includes("Vline");
  const isVphase = mode.includes("Vphase");
  const isIline = mode.includes("Iline");
  const isIphase = mode.includes("Iphase");

  const resultLabel = mode.includes("_Vline") ? "Tensión de Línea"
    : mode.includes("_Vphase") ? "Tensión de Fase"
    : mode.includes("_Iline") ? "Corriente de Línea"
    : "Corriente de Fase";
  const resultUnit = mode.includes("_V") ? "V" : "A";

  return (
    <div className="space-y-5">
      <SectionLabel>Delta / Estrella</SectionLabel>
      <SelectField label="Configuración" value={mode} onChange={setMode}>
        {DELTA_STAR_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
      </SelectField>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {isVline && <NumberInput label="Tensión de Línea" value={Vline} onChange={setVline} unit="V" />}
        {isVphase && <NumberInput label="Tensión de Fase" value={Vphase} onChange={setVphase} unit="V" />}
        {isIline && <NumberInput label="Corriente de Línea" value={Iline} onChange={setIline} unit="A" />}
        {isIphase && <NumberInput label="Corriente de Fase" value={Iphase} onChange={setIphase} unit="A" />}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ResultCard title={resultLabel} value={result?.value} unit={resultUnit} />
        {result?.note && (
          <div className="flex items-center rounded-xl border border-border-custom bg-surface2 p-4">
            <span className="text-sm text-text-muted italic">{result.note}</span>
          </div>
        )}
        <ErrorCard error={result?.error} />
      </div>
    </div>
  );
}

function DCModule({ mode, setMode, voltage, setVoltage, current, setCurrent, resistance, setResistance, power, setPower, result }) {
  const resultMeta = {
    dc_voltage: { title: "Voltaje", unit: "V" },
    dc_current: { title: "Corriente", unit: "A" },
    dc_resistance: { title: "Resistencia", unit: "Ω" },
    dc_power: { title: "Potencia", unit: "W" },
    dc_currentFromPowerV: { title: "Corriente", unit: "A" },
    dc_voltageFromPowerI: { title: "Voltaje", unit: "V" },
  };

  return (
    <div className="space-y-5">
      <SectionLabel>Corriente Directa (CD)</SectionLabel>
      <SelectField label="Calcular" value={mode} onChange={setMode}>
        {DC_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
      </SelectField>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {mode === "dc_voltage" && (<>
          <NumberInput label="Corriente" value={current} onChange={setCurrent} unit="A" />
          <NumberInput label="Resistencia" value={resistance} onChange={setResistance} unit="Ω" />
        </>)}
        {mode === "dc_current" && (<>
          <NumberInput label="Voltaje" value={voltage} onChange={setVoltage} unit="V" />
          <NumberInput label="Resistencia" value={resistance} onChange={setResistance} unit="Ω" />
        </>)}
        {mode === "dc_resistance" && (<>
          <NumberInput label="Voltaje" value={voltage} onChange={setVoltage} unit="V" />
          <NumberInput label="Corriente" value={current} onChange={setCurrent} unit="A" />
        </>)}
        {mode === "dc_power" && (<>
          <NumberInput label="Voltaje" value={voltage} onChange={setVoltage} unit="V" />
          <NumberInput label="Corriente" value={current} onChange={setCurrent} unit="A" />
        </>)}
        {mode === "dc_currentFromPowerV" && (<>
          <NumberInput label="Potencia" value={power} onChange={setPower} unit="W" />
          <NumberInput label="Voltaje" value={voltage} onChange={setVoltage} unit="V" />
        </>)}
        {mode === "dc_voltageFromPowerI" && (<>
          <NumberInput label="Potencia" value={power} onChange={setPower} unit="W" />
          <NumberInput label="Corriente" value={current} onChange={setCurrent} unit="A" />
        </>)}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {resultMeta[mode] && (
          <ResultCard title={resultMeta[mode].title} value={result?.value} unit={resultMeta[mode].unit} />
        )}
        <ErrorCard error={result?.error} />
      </div>
    </div>
  );
}

// ─── Panel historial ─────────────────────────────────────────────────────────

function HistoryPanel({ history, onClear, onExportCSV, onExportPDF }) {
  return (
    <div className="rounded-xl border border-border-custom bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest text-green">
          Historial ({history.length})
        </h2>
        <div className="flex gap-2">
          <ExportButton onClick={onExportCSV} label="CSV" />
          <ExportButton onClick={onExportPDF} label="PDF" />
          <button
            onClick={onClear}
            className="rounded-lg border border-border-custom px-3 py-1.5 font-display text-xs font-semibold uppercase text-text-muted transition hover:border-red-500 hover:text-red-400"
          >
            Limpiar
          </button>
        </div>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {history.map((h, i) => (
          <div key={i} className="rounded-lg border border-border-custom bg-surface2 p-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-green">
                {h.module} — {h.mode}
              </span>
              <span className="text-xs text-text-muted">{h.timestamp}</span>
            </div>
            <div className="mt-1 text-xs text-text-muted">{h.inputs}</div>
            <div className="mt-1 font-display text-sm font-semibold text-text-base">→ {h.result}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Primitivas de UI ────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div className="font-display text-xs font-bold uppercase tracking-widest text-text-muted border-b border-border-custom pb-2">
      {children}
    </div>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-text-muted">{label}</label>
      <select
        className="w-full rounded-lg border border-border-custom bg-surface2 p-2 text-sm text-text-base outline-none transition focus:border-green-dim focus:ring-2 focus:ring-green-soft"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </div>
  );
}

function NumberInput({ label, value, onChange, unit, min = 0, max, step = 0.1 }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-text-muted">{label}</label>
      <div className="flex">
        <input
          className="w-full rounded-l-lg border border-border-custom bg-surface2 p-2 text-sm text-text-base outline-none transition focus:border-green-dim focus:ring-2 focus:ring-green-soft"
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {unit && (
          <span className="flex items-center rounded-r-lg border border-l-0 border-border-custom bg-surface2 px-3 font-display text-xs font-semibold text-green">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function ResultCard({ title, value, unit }) {
  return (
    <div className="rounded-xl border border-border-custom bg-surface2 p-4">
      <div className="mb-1 font-display text-xs uppercase tracking-widest text-text-muted">{title}</div>
      <div className="font-display text-4xl font-bold text-green">
        {Number.isFinite(value) ? value.toFixed(3) : "—"}
        {unit && <span className="ml-1 text-base font-normal text-text-muted">{unit}</span>}
      </div>
    </div>
  );
}

function ErrorCard({ error }) {
  if (!error) return null;
  return (
    <div className="col-span-full rounded-lg border border-red-500 bg-red-900/20 p-3 text-sm text-red-400">
      {error}
    </div>
  );
}

function ExportButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-green px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wider text-green transition hover:bg-green/10"
    >
      ↓ {label}
    </button>
  );
}