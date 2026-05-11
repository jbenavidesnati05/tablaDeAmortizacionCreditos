"use client";

import { useState, useMemo } from "react";
import CreditForm from "@/components/CreditForm";
import SummaryCards from "@/components/SummaryCards";
import AmortizationTable from "@/components/AmortizationTable";
import { calcularResumen, convertirTasaMensual, formatCOP } from "@/lib/finance";
import { exportarCSV } from "@/utils/export";
import type { FormularioCredito } from "@/types";

const FORM_INICIAL: FormularioCredito = {
  valorCredito: 0,
  plazoMeses: 0,
  tasa: 0,
  tipoTasa: "efectiva_anual",
  sistemaAmortizacion: "frances",
  tipoSeguro: "fijo",
  valorSeguro: 0,
  otrosCostos: [],
};

const TIPOS_CREDITO = [
  { id: "libre",      label: "Libre inversión", icon: "💼" },
  { id: "vehiculo",   label: "Vehículo",         icon: "🚗" },
  { id: "educativo",  label: "Educativo",         icon: "🎓" },
  { id: "hipotecario",label: "Hipotecario",       icon: "🏠" },
  { id: "otro",       label: "Otro",              icon: "✦"  },
];

export default function Home() {
  const [form, setForm] = useState<FormularioCredito>(FORM_INICIAL);
  const [tipoCredito, setTipoCredito] = useState("libre");

  const resumen = useMemo(() => {
    if (form.valorCredito <= 0 || form.plazoMeses <= 0) return null;
    return calcularResumen(form);
  }, [form]);

  const tasaMensual = useMemo(
    () => convertirTasaMensual(form.tasa, form.tipoTasa),
    [form.tasa, form.tipoTasa]
  );

  const errores = useMemo(() => {
    const msgs: string[] = [];
    if (form.valorCredito <= 0) msgs.push("El valor del crédito debe ser mayor que cero.");
    if (form.plazoMeses <= 0) msgs.push("El plazo debe ser mayor que cero.");
    if (form.tasa < 0) msgs.push("La tasa de interés no puede ser negativa.");
    if (form.valorSeguro < 0) msgs.push("El valor del seguro no puede ser negativo.");
    form.otrosCostos.forEach((c) => {
      if (c.valor < 0) msgs.push(`El costo "${c.nombre || "sin nombre"}" no puede ser negativo.`);
    });
    return msgs;
  }, [form]);

  const listo = resumen !== null && errores.length === 0;

  const lecturaRapida = useMemo(() => {
    if (!listo || !resumen) return null;
    const cuotaTotal = resumen.tabla[0]?.cuotaTotal ?? resumen.cuotaMensualBase;
    const pctIntereses = ((resumen.totalIntereses / form.valorCredito) * 100).toFixed(1);
    const pctCosto = ((resumen.costoTotalCredito / form.valorCredito) * 100).toFixed(1);
    return { cuotaTotal, pctIntereses, pctCosto };
  }, [listo, resumen, form.valorCredito]);

  function handleReset() { setForm(FORM_INICIAL); }
  function handleExportCSV() { if (resumen) exportarCSV(resumen.tabla); }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">

      {/* ── Hero ── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        {/* decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 rounded-full px-3 py-1 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-blue-300 text-xs font-medium tracking-wide">COP · E.A. o N.M.V. · Sistema Francés</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                Simulador de Créditos
                <span className="block text-blue-400">Colombia</span>
              </h1>
              <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed">
                Calcula cuotas, intereses, seguros y tabla de amortización en segundos. Resultados claros y educativos.
              </p>
            </div>

            {/* Stats decorativos */}
            <div className="flex sm:flex-col gap-3 sm:gap-2">
              {[
                { label: "Sistemas de amortización", val: "2" },
                { label: "Tipos de tasa soportados", val: "2" },
                { label: "Costos personalizables", val: "∞" },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-2xl font-bold text-white">{s.val}</p>
                  <p className="text-xs text-slate-500 leading-tight mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Tipo de crédito ── */}
      <div className="border-b border-slate-100 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap mr-1 shrink-0">Tipo:</span>
            {TIPOS_CREDITO.map((t) => (
              <button
                key={t.id}
                onClick={() => setTipoCredito(t.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 ${
                  tipoCredito === t.id
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Errores ── */}
        {errores.length > 0 && form.valorCredito > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 animate-fade-in">
            <div className="shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700 mb-1">Corrige los siguientes campos:</p>
              <ul className="space-y-0.5">
                {errores.map((e) => (
                  <li key={e} className="text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── Layout principal ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <div className="lg:col-span-2">
            <CreditForm
              form={form}
              onChange={setForm}
              onReset={handleReset}
              tipoCredito={tipoCredito}
            />
          </div>
          <div className="lg:col-span-3">
            {listo && resumen ? (
              <div className="animate-fade-up">
                <SummaryCards resumen={resumen} form={form} tasaMensual={tasaMensual} />
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        {/* ── Lectura rápida ── */}
        {listo && resumen && lecturaRapida && (
          <div className="mt-6 animate-fade-up">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center text-base">📖</div>
                <div>
                  <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-1">Resumen rápido</p>
                  <p className="text-sm sm:text-base leading-relaxed">
                    Solicitando{" "}
                    <span className="font-bold text-white">{formatCOP(form.valorCredito)}</span>{" "}
                    a{" "}
                    <span className="font-bold">{form.plazoMeses} meses</span>,
                    pagarías aproximadamente{" "}
                    <span className="font-bold text-emerald-300">{formatCOP(lecturaRapida.cuotaTotal)}/mes</span>{" "}
                    y un total de{" "}
                    <span className="font-bold">{formatCOP(resumen.totalPagado)}</span>.{" "}
                    Los intereses representan el{" "}
                    <span className="font-bold text-yellow-300">{lecturaRapida.pctIntereses}%</span>{" "}
                    del valor solicitado y el costo total del crédito equivale al{" "}
                    <span className="font-bold text-orange-300">{lecturaRapida.pctCosto}%</span> adicional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tabla de amortización ── */}
        {listo && resumen && (
          <div className="mt-6 animate-fade-up">
            <AmortizationTable tabla={resumen.tabla} onExportCSV={handleExportCSV} />
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 mt-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-700">Simulador de Créditos Colombia</span>
            </div>
            <p className="text-xs text-slate-400 text-center sm:text-right max-w-md">
              Herramienta informativa. Los valores reales pueden variar según la entidad financiera, seguros, comisiones y condiciones del crédito.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card min-h-[480px] flex flex-col items-center justify-center text-center gap-6 border-dashed">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center shadow-inner">
        <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div>
        <p className="text-slate-800 font-bold text-xl">Configura tu crédito</p>
        <p className="text-slate-400 text-sm mt-2 max-w-sm leading-relaxed">
          Diligencia los datos básicos en el formulario y obtén una simulación inmediata con cuotas, intereses y tabla de amortización.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {[
          { icon: "💰", label: "Cuota mensual" },
          { icon: "📈", label: "Total intereses" },
          { icon: "📋", label: "Tabla de cuotas" },
        ].map((item) => (
          <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col items-center gap-1.5">
            <span className="text-xl">{item.icon}</span>
            <p className="text-xs text-slate-400 leading-tight">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="w-full max-w-xs">
        <div className="flex gap-1.5 items-center justify-center text-xs text-slate-400">
          {["Monto", "Plazo", "Tasa", "Resultado"].map((step, i) => (
            <div key={step} className="flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">{i + 1}</div>
                <span>{step}</span>
              </div>
              {i < 3 && <span className="text-slate-300">›</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
