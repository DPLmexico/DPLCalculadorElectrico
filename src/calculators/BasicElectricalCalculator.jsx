import { useState } from "react";
import { electriCalculator, calculatePower } from "../logic/basicElectrical";

export default function BasicElectricalCalculator() {
  const [voltage, setVoltage] = useState(220);
  const [current, setCurrent] = useState(10);
  const [system, setSystem] = useState("tri");
  const [apparentPower, setApparentPower] = useState(500);
  const [activePower, setActivePower] = useState(900);
  const [reactivePower, setReactivePower] = useState(400);
  const [powerFactor, setPowerFactor] = useState(0.9);
  const [mode, setMode] = useState("current");


  const electriCalc = electriCalculator({
    system,
    mode,
    voltage,
    current,
    apparentPower,
    activePower,
    powerFactor,
  });
  console.log(electriCalc);

  const powerCalc = calculatePower({
    mode,
    apparentPower,
    activePower,
    reactivePower,
    powerFactor,
  });

  const modes = {
      voltage: { title: "Voltaje", unit: "V" },
      current: { title: "Corriente", unit: "A" },
      apparentPower: { title: "Potencia Aparente", unit: "VA" },
      activePower : { title: "Potencia Activa", unit: "W"},
      CurrentFromActivePowerPF: { title: "Corriente (con Potencia Activa y Factor de Potencia)", unit: "A" },
  };

  return (
    <div className="min-h-screen bg-black p-6 font-body text-text-base">
      <div className="mx-auto max-w-3xl rounded-xl border border-border-custom bg-surface p-6 shadow-sm shadow-black/40">
        <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide text-green">
          Calculadora Electrica Basica
        </h1>

        <div className="mb-6">
          <label className="mb-2 block text-sm text-text-muted">Sistema</label>
          <select
            className="w-full rounded-lg border border-border-custom bg-surface2 p-2 text-text-base outline-none transition focus:border-green-dim focus:ring-2 focus:ring-green-soft"
            value={system}
            onChange={(e) => setSystem(e.target.value)}
          >
            <option value="mono">Monofasico</option>
            <option value="tri">Trifasico</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm text-text-muted">Modo</label>
          <select
            className="w-full rounded-lg border border-border-custom bg-surface2 p-2 text-text-base outline-none transition focus:border-green-dim focus:ring-2 focus:ring-green-soft"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="voltage">Voltaje</option>
            <option value="current">Corriente</option>
            <option value="apparentPower">Potencia Aparente</option>
            <option value="activePower">Potencia Activa</option>
            <option value="reactivePower">Potencia Reactiva</option>
            <option value="CurrentFromActivePowerPF">Corriente (con Potencia Activa y Factor de Potencia)</option>
          </select>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            { mode === "voltage" && (
                <>
                  <Input label="Corriente" value={current} setValue={setCurrent} unit="A" />
                  <Input label="Potencia Aparente" value={apparentPower} setValue={setApparentPower} unit="VA" />
                </>
            )}
            { mode === "current" && (
                <>
                  <Input label="Voltaje" value={voltage} setValue={setVoltage} unit="V" />
                  <Input label="Potencia Aparente" value={apparentPower} setValue={setApparentPower} unit="VA" />
                </>
            )}
            { mode === "apparentPower" && (
                <>
                  <Input label="Voltaje" value={voltage} setValue={setVoltage} unit="V" />
                  <Input label="Corriente" value={current} setValue={setCurrent} unit="A" />
                </>
            )}
            { mode === "activePower" && (
                <>
                  <Input label="Potencia aparente" value={apparentPower} setValue={setApparentPower} unit="VA" />
                  <Input label="Factor de potencia" value={powerFactor} setValue={setPowerFactor} unit="" />
                </>
            )}
            { mode === "reactivePower" && (
                <>
                  <Input label="Potencia aparente" value={apparentPower} setValue={setApparentPower} unit="VA" />
                  <Input label="Potencia activa" value={activePower} setValue={setActivePower} unit="W" />
                </>
            )}
            { mode === "CurrentFromActivePowerPF" && (
                <>
                  <Input label="Voltaje" value={voltage} setValue={setVoltage} unit="V" />
                  <Input label="Potencia activa" value={activePower} setValue={setActivePower} unit="W" />
                  <InputPF label="Factor de potencia" value={powerFactor} setValue={setPowerFactor} unit="" />
                </>
            )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {modes[mode] && (
                <Result
                    title={modes[mode].title}
                    value={electriCalc?.value}
                    unit={modes[mode].unit}
                />
                )}
            {mode === "CurrentFromActivePowerPF" && (
                <Result
                    title={"Potencia Aparente"}
                    value={(powerCalc?.val1?.value)}
                    unit={"VA"}
                />
                )}
            {mode === "CurrentFromActivePowerPF" && (
                <Result
                    title={"Potencia Reactiva"}
                    value={(powerCalc?.val2?.value)}
                    unit={"VAR"}
                />
                )}
            {mode === "reactivePower" && (
                <Result
                      title={"Potencia Reactiva"}
                      value={(powerCalc?.value?.val1)}
                      unit={"VAR"}
                  />
                )}
            {mode === "reactivePower" && (
                <Result
                      title={"Factor de Potencia"}
                      value={(powerCalc?.value?.val2)}
                      unit={""}
                  />
                )}
            {electriCalc?.error && (
                <div className="mt-4 rounded-lg border border-red-500 bg-red-900/20 p-3 text-red-400">
                    {electriCalc.error}
                </div>
            )}
            {powerCalc?.error && (
                <div className="mt-4 rounded-lg border border-red-500 bg-red-900/20 p-3 text-red-400">
                    {powerCalc.error}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, setValue, unit }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-text-muted">{label}</label>
      <div className="flex">
        <input
          className="w-full rounded-l-lg border border-border-custom bg-surface2 p-2 text-text-base outline-none transition focus:border-green-dim focus:ring-2 focus:ring-green-soft"
          type="number"
          value={value}
          min={0}
          step="0.1"
          onChange={(e) => setValue(Number(e.target.value))}
        />
        <span className="flex items-center rounded-r-lg border border-l-0 border-border-custom bg-surface2 px-3 font-display text-sm font-semibold text-green">
          {unit}
        </span>
      </div>
    </div>
  );
}

function InputPF({ label, value, setValue, unit }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-text-muted">{label}</label>
      <div className="flex">
        <input
          className="w-full rounded-l-lg border border-border-custom bg-surface2 p-2 text-text-base outline-none transition focus:border-green-dim focus:ring-2 focus:ring-green-soft"
          type="number"
          value={value}
          min={0}
          max={1}
          step="0.01"
          onChange={(e) => setValue(Number(e.target.value))}
        />
        <span className="flex items-center rounded-r-lg border border-l-0 border-border-custom bg-surface2 px-3 font-display text-sm font-semibold text-green">
          {unit}
        </span>
      </div>
    </div>
  );
}

function Result({ title, value, unit }) {
  return (
    <div className="rounded-xl border border-border-custom bg-surface2 p-4">
      <div className="mb-1 font-display text-xs uppercase tracking-widest text-text-muted">{title}</div>
      <div className="font-display text-4xl font-bold text-green">
        {Number.isFinite(value) ? value.toFixed(3) : "-"}
        <span className="ml-1 text-base font-normal text-text-muted">{unit}</span>
      </div>
    </div>
  );
}

