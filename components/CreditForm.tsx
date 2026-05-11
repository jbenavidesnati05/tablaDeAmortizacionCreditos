"use client";

import { useState } from "react";
import type {
  FormularioCredito, OtroCosto, TipoTasa,
  SistemaAmortizacion, TipoSeguro, FrecuenciaCosto,
} from "@/types";

interface Props {
  form: FormularioCredito;
  onChange: (form: FormularioCredito) => void;
  onReset: () => void;
  tipoCredito: string;
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

const PLACEHOLDERS_MONTO: Record<string, string> = {
  libre:       "Ej: 20.000.000",
  vehiculo:    "Ej: 45.000.000",
  educativo:   "Ej: 15.000.000",
  hipotecario: "Ej: 200.000.000",
  otro:        "Ej: 10.000.000",
};

export default function CreditForm({ form, onChange, onReset, tipoCredito }: Props) {
  const [plazoEnAnios, setPlazoEnAnios] = useState(false);
  const [anios, setAnios] = useState("");
  const [mostrarTooltipTasa, setMostrarTooltipTasa] = useState(false);

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

  function togglePlazoAnios(modo: "meses" | "años") {
    const enAnios = modo === "años";
    setPlazoEnAnios(enAnios);
    setAnios("");
    set("plazoMeses", 0);
  }

  function addOtroCosto() {
    const nuevo: OtroCosto = { id: generateId(), nombre: "", valor: 0, frecuencia: "unica_vez" };
    set("otrosCostos", [...form.otrosCostos, nuevo]);
  }

  function updateOtroCosto(id: string, campo: keyof OtroCosto, valor: string | number) {
    set("otrosCostos", form.otrosCostos.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)));
  }

  function removeOtroCosto(id: string) {
    set("otrosCostos", form.otrosCostos.filter((c) => c.id !== id));
  }

  const placeholderMonto = PLACEHOLDERS_MONTO[tipoCredito] ?? "Ej: 20.000.000";

  // Progreso del formulario
  const pasos = [
    form.valorCredito > 0,
    form.plazoMeses > 0,
    form.tasa > 0,
    true, // sistema siempre tiene valor por defecto
  ];
  const progreso = pasos.filter(Boolean).length;

  return (
    <div className="card space-y-0 p-0 overflow-hidden">

      {/* Cabecera del formulario */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Configura tu crédito</h2>
            <p className="text-xs text-slate-400 mt-0.5">Completa los campos para obtener tu simulación</p>
          </div>
          <button onClick={onReset} className="btn-ghost-danger">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Limpiar
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="flex items-center gap-1.5">
          {["Monto", "Plazo", "Tasa", "Sistema"].map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1 w-full rounded-full transition-all duration-300 ${i < progreso ? "bg-blue-500" : "bg-slate-100"}`} />
              <span className={`text-[10px] font-medium transition-colors duration-300 ${i < progreso ? "text-blue-500" : "text-slate-300"}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-5 space-y-6">

        {/* ── 1. Monto ── */}
        <FormSection
          icon="💰"
          title="¿Cuánto dinero necesitas?"
          hint="Ingresa el valor total del crédito que quieres solicitar."
        >
          <label className="label-base">Monto solicitado (COP)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold pointer-events-none">$</span>
            <input
              type="number"
              min={0}
              className="input-base pl-8"
              placeholder={placeholderMonto}
              value={form.valorCredito || ""}
              onChange={(e) => set("valorCredito", parseFloat(e.target.value) || 0)}
            />
          </div>
        </FormSection>

        {/* ── 2. Plazo ── */}
        <FormSection
          icon="📅"
          title="¿En cuánto tiempo lo pagarás?"
          hint="Define la duración del crédito en meses o años."
        >
          {/* Toggle meses / años */}
          <div className="flex gap-2 mb-3">
            {(["meses", "años"] as const).map((modo) => (
              <button
                key={modo}
                type="button"
                onClick={() => togglePlazoAnios(modo)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                  (modo === "meses" && !plazoEnAnios) || (modo === "años" && plazoEnAnios)
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
              >
                {modo.charAt(0).toUpperCase() + modo.slice(1)}
              </button>
            ))}
          </div>
          <label className="label-base">{plazoEnAnios ? "Cantidad de años" : "Cantidad de meses"}</label>
          <input
            type="number"
            min={1}
            className="input-base"
            placeholder={plazoEnAnios ? "Ej: 5 años" : "Ej: 60 meses"}
            value={plazoEnAnios ? anios : form.plazoMeses || ""}
            onChange={(e) => handlePlazo(e.target.value)}
          />
          {plazoEnAnios && form.plazoMeses > 0 && (
            <p className="text-xs text-blue-600 font-medium mt-1.5">
              = {form.plazoMeses} meses en total
            </p>
          )}
        </FormSection>

        {/* ── 3. Tasa de interés ── */}
        <FormSection
          icon="📊"
          title="¿Qué tasa te ofrecieron?"
          hint="Ingresa la tasa de interés tal como la informó la entidad financiera."
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-base">Tipo de tasa</label>
              <div className="relative">
                <select
                  className="select-base"
                  value={form.tipoTasa}
                  onChange={(e) => set("tipoTasa", e.target.value as TipoTasa)}
                >
                  <option value="efectiva_anual">Efectiva anual (E.A.)</option>
                  <option value="nominal_mensual">Nominal mensual (N.M.V.)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label-base">
                Tasa {form.tipoTasa === "efectiva_anual" ? "anual" : "mensual"}
              </label>
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
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">%</span>
              </div>
            </div>
          </div>

          {/* Tooltip de tasas */}
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setMostrarTooltipTasa((v) => !v)}
              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {mostrarTooltipTasa ? "Ocultar explicación" : "¿Cuál es la diferencia?"}
            </button>
            {mostrarTooltipTasa && (
              <div className="mt-2 bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 space-y-1.5 animate-fade-in">
                <p><strong>Efectiva anual (E.A.):</strong> La tasa que realmente pagas en un año. Se convierte automáticamente a mensual con la fórmula: <code className="bg-blue-100 px-1 rounded">(1+EA)^(1/12)−1</code>.</p>
                <p><strong>Nominal mensual (N.M.V.):</strong> La tasa que se aplica directamente cada mes. Úsala si el banco te cotizó en mensual vencido.</p>
              </div>
            )}
            {form.tipoTasa === "nominal_mensual" && !mostrarTooltipTasa && (
              <p className="text-xs text-blue-500 mt-1.5 flex items-center gap-1">
                <span>ℹ️</span> Se aplica directamente cada mes sin conversión.
              </p>
            )}
          </div>
        </FormSection>

        {/* ── 4. Sistema de amortización ── */}
        <FormSection
          icon="🔄"
          title="Sistema de amortización"
          hint="Define cómo se distribuye el pago de capital mes a mes."
        >
          <div className="grid grid-cols-1 gap-2">
            {(["frances", "abono_fijo"] as SistemaAmortizacion[]).map((sistema) => (
              <label
                key={sistema}
                className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                  form.sistemaAmortizacion === sistema
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  form.sistemaAmortizacion === sistema ? "border-blue-500" : "border-slate-300"
                }`}>
                  {form.sistemaAmortizacion === sistema && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <input
                  type="radio"
                  name="sistema"
                  value={sistema}
                  checked={form.sistemaAmortizacion === sistema}
                  onChange={() => set("sistemaAmortizacion", sistema)}
                  className="sr-only"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {sistema === "frances" ? "Cuota fija — Sistema Francés" : "Abono fijo a capital"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {sistema === "frances"
                      ? "Pagas la misma cuota todos los meses. El interés disminuye y el capital aumenta gradualmente."
                      : "Abonas la misma cantidad de capital cada mes. La cuota disminuye con el tiempo."}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </FormSection>

        {/* ── 5. Seguro mensual ── */}
        <FormSection
          icon="🛡️"
          title="Seguro mensual"
          hint="Si el crédito incluye seguro de vida o deudores, agrégalo aquí. Déjalo en 0 si no aplica."
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-base">Tipo de seguro</label>
              <select
                className="select-base"
                value={form.tipoSeguro}
                onChange={(e) => set("tipoSeguro", e.target.value as TipoSeguro)}
              >
                <option value="fijo">Valor fijo (COP/mes)</option>
                <option value="porcentaje_saldo">% sobre saldo</option>
              </select>
            </div>
            <div>
              <label className="label-base">
                {form.tipoSeguro === "fijo" ? "Valor mensual" : "Porcentaje (%)"}
              </label>
              <div className="relative">
                {form.tipoSeguro === "fijo" && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">$</span>
                )}
                <input
                  type="number"
                  min={0}
                  step={form.tipoSeguro === "fijo" ? 1000 : 0.01}
                  className={`input-base ${form.tipoSeguro === "fijo" ? "pl-8" : "pr-8"}`}
                  placeholder={form.tipoSeguro === "fijo" ? "50.000" : "0.3"}
                  value={form.valorSeguro || ""}
                  onChange={(e) => set("valorSeguro", parseFloat(e.target.value) || 0)}
                />
                {form.tipoSeguro === "porcentaje_saldo" && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">%</span>
                )}
              </div>
            </div>
          </div>
        </FormSection>

        {/* ── 6. Costos adicionales ── */}
        <FormSection
          icon="📋"
          title="Costos adicionales del crédito"
          hint="Agrega estudio de crédito, aval, administración u otros cargos de la entidad."
        >
          <div className="space-y-2">
            {form.otrosCostos.map((costo) => (
              <div key={costo.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <label className="label-base">Nombre</label>
                    <input
                      type="text"
                      className="input-base text-xs py-2"
                      placeholder="Ej: Estudio de crédito"
                      value={costo.nombre}
                      onChange={(e) => updateOtroCosto(costo.id, "nombre", e.target.value)}
                    />
                  </div>
                  <div className="col-span-4">
                    <label className="label-base">Valor (COP)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">$</span>
                      <input
                        type="number"
                        min={0}
                        className="input-base text-xs py-2 pl-6"
                        placeholder="0"
                        value={costo.valor || ""}
                        onChange={(e) => updateOtroCosto(costo.id, "valor", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="col-span-3 flex items-end">
                    <button
                      onClick={() => removeOtroCosto(costo.id)}
                      className="w-full py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label-base">Frecuencia de cobro</label>
                  <select
                    className="select-base text-xs py-2"
                    value={costo.frecuencia}
                    onChange={(e) => updateOtroCosto(costo.id, "frecuencia", e.target.value as FrecuenciaCosto)}
                  >
                    <option value="unica_vez">Una sola vez al inicio</option>
                    <option value="mensual">Mensual (cada cuota)</option>
                  </select>
                </div>
              </div>
            ))}
            <button
              onClick={addOtroCosto}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-xs font-semibold text-slate-500
                         hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all duration-150 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar costo adicional
            </button>
          </div>
        </FormSection>

      </div>
    </div>
  );
}

function FormSection({
  icon, title, hint, children,
}: {
  icon: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5">
        <span className="text-lg leading-none mt-0.5">{icon}</span>
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{hint}</p>
        </div>
      </div>
      <div className="pl-7">
        {children}
      </div>
    </div>
  );
}
