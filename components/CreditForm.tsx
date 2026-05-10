"use client";

import { useState } from "react";
import type { FormularioCredito, OtroCosto, TipoTasa, SistemaAmortizacion, TipoSeguro, FrecuenciaCosto } from "@/types";

interface Props {
  form: FormularioCredito;
  onChange: (form: FormularioCredito) => void;
  onReset: () => void;
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function CreditForm({ form, onChange, onReset }: Props) {
  const [plazoEnAnios, setPlazoEnAnios] = useState(false);
  const [anios, setAnios] = useState("");

  function set<K extends keyof FormularioCredito>(key: K, value: FormularioCredito[K]) {
    onChange({ ...form, [key]: value });
  }

  function handlePlazo(val: string) {
    const num = parseFloat(val);
    if (plazoEnAnios) {
      setAnios(val);
      set("plazoMeses", isNaN(num) ? 0 : Math.round(num * 12));
    } else {
      set("plazoMeses", isNaN(num) ? 0 : Math.round(num));
    }
  }

  function togglePlazoAnios(checked: boolean) {
    setPlazoEnAnios(checked);
    setAnios("");
    set("plazoMeses", 0);
  }

  function addOtroCosto() {
    const nuevo: OtroCosto = { id: generateId(), nombre: "", valor: 0, frecuencia: "unica_vez" };
    set("otrosCostos", [...form.otrosCostos, nuevo]);
  }

  function updateOtroCosto(id: string, campo: keyof OtroCosto, valor: string | number) {
    set(
      "otrosCostos",
      form.otrosCostos.map((c) => (c.id === id ? { ...c, [campo]: valor } : c))
    );
  }

  function removeOtroCosto(id: string) {
    set("otrosCostos", form.otrosCostos.filter((c) => c.id !== id));
  }

  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Datos del Crédito</h2>
        <button onClick={onReset} className="btn-danger text-xs">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Limpiar
        </button>
      </div>

      {/* Valor del crédito */}
      <Section title="1. Valor del Crédito">
        <Field label="Monto solicitado (COP)">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
            <input
              type="number"
              min={0}
              className="input-base pl-7"
              placeholder="50.000.000"
              value={form.valorCredito || ""}
              onChange={(e) => set("valorCredito", parseFloat(e.target.value) || 0)}
            />
          </div>
        </Field>
      </Section>

      {/* Plazo */}
      <Section title="2. Plazo del Crédito">
        <div className="flex items-center gap-2 mb-3">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
            <input
              type="checkbox"
              checked={plazoEnAnios}
              onChange={(e) => togglePlazoAnios(e.target.checked)}
              className="rounded"
            />
            Ingresar en años
          </label>
        </div>
        <Field label={plazoEnAnios ? "Años" : "Meses"}>
          <input
            type="number"
            min={1}
            className="input-base"
            placeholder={plazoEnAnios ? "5" : "60"}
            value={plazoEnAnios ? anios : form.plazoMeses || ""}
            onChange={(e) => handlePlazo(e.target.value)}
          />
        </Field>
        {plazoEnAnios && form.plazoMeses > 0 && (
          <p className="text-xs text-slate-500 mt-1">Equivale a <strong>{form.plazoMeses} meses</strong></p>
        )}
      </Section>

      {/* Tasa de interés */}
      <Section title="3. Tasa de Interés">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Tipo de tasa">
            <select
              className="select-base"
              value={form.tipoTasa}
              onChange={(e) => set("tipoTasa", e.target.value as TipoTasa)}
            >
              <option value="efectiva_anual">Efectiva anual (E.A.) (%)</option>
              <option value="nominal_mensual">Nominal mensual (N.M.V.) (%)</option>
            </select>
          </Field>
          <Field label={`Tasa ${form.tipoTasa === "efectiva_anual" ? "anual" : "mensual"} (%)`}>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={0.01}
                className="input-base pr-8"
                placeholder={form.tipoTasa === "nominal_mensual" ? "1.5" : "18"}
                value={form.tasa || ""}
                onChange={(e) => set("tasa", parseFloat(e.target.value) || 0)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
            </div>
          </Field>
        </div>
        {form.tipoTasa === "nominal_mensual" && (
          <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg p-2 mt-2">
            ℹ️ Tasa nominal mensual vencida: se aplica directamente cada mes sin conversión.
          </p>
        )}
      </Section>

      {/* Sistema de amortización */}
      <Section title="4. Sistema de Amortización">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(["frances", "abono_fijo"] as SistemaAmortizacion[]).map((sistema) => (
            <label
              key={sistema}
              className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                form.sistemaAmortizacion === sistema
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="sistema"
                value={sistema}
                checked={form.sistemaAmortizacion === sistema}
                onChange={() => set("sistemaAmortizacion", sistema)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {sistema === "frances" ? "Cuota fija (Francés)" : "Abono fijo a capital"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {sistema === "frances"
                    ? "Cuota mensual igual durante todo el crédito"
                    : "El capital se abona en partes iguales, la cuota varía"}
                </p>
              </div>
            </label>
          ))}
        </div>
      </Section>

      {/* Seguro */}
      <Section title="5. Seguro Mensual">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Tipo de seguro">
            <select
              className="select-base"
              value={form.tipoSeguro}
              onChange={(e) => set("tipoSeguro", e.target.value as TipoSeguro)}
            >
              <option value="fijo">Valor fijo mensual (COP)</option>
              <option value="porcentaje_saldo">Porcentaje sobre saldo (%)</option>
            </select>
          </Field>
          <Field label={form.tipoSeguro === "fijo" ? "Valor seguro (COP)" : "Porcentaje seguro (%)"}>
            <div className="relative">
              {form.tipoSeguro === "fijo" && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              )}
              <input
                type="number"
                min={0}
                step={form.tipoSeguro === "fijo" ? 1000 : 0.01}
                className={`input-base ${form.tipoSeguro === "fijo" ? "pl-7" : "pr-8"}`}
                placeholder={form.tipoSeguro === "fijo" ? "50.000" : "0.3"}
                value={form.valorSeguro || ""}
                onChange={(e) => set("valorSeguro", parseFloat(e.target.value) || 0)}
              />
              {form.tipoSeguro === "porcentaje_saldo" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
              )}
            </div>
          </Field>
        </div>
      </Section>

      {/* Otros costos */}
      <Section title="6. Otros Costos">
        <div className="space-y-3">
          {form.otrosCostos.map((costo) => (
            <div key={costo.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 rounded-xl p-3">
              <div className="col-span-4">
                <label className="label-base">Nombre</label>
                <input
                  type="text"
                  className="input-base text-xs"
                  placeholder="Estudio crédito"
                  value={costo.nombre}
                  onChange={(e) => updateOtroCosto(costo.id, "nombre", e.target.value)}
                />
              </div>
              <div className="col-span-3">
                <label className="label-base">Valor (COP)</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    min={0}
                    className="input-base text-xs pl-5"
                    placeholder="0"
                    value={costo.valor || ""}
                    onChange={(e) => updateOtroCosto(costo.id, "valor", parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="col-span-4">
                <label className="label-base">Frecuencia</label>
                <select
                  className="select-base text-xs"
                  value={costo.frecuencia}
                  onChange={(e) => updateOtroCosto(costo.id, "frecuencia", e.target.value as FrecuenciaCosto)}
                >
                  <option value="unica_vez">Una sola vez (inicio)</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>
              <div className="col-span-1 flex items-end justify-center pb-0.5">
                <button
                  onClick={() => removeOtroCosto(costo.id)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          <button onClick={addOtroCosto} className="btn-secondary text-xs w-full justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar costo adicional
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-slate-100 pt-4 first:border-0 first:pt-0">
      <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-base">{label}</label>
      {children}
    </div>
  );
}
