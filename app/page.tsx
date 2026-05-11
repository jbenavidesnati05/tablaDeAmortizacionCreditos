"use client";

import { useState, useMemo } from "react";
import CreditForm from "@/components/CreditForm";
import SummaryCards from "@/components/SummaryCards";
import AmortizationTable from "@/components/AmortizationTable";
import { calcularResumen, convertirTasaMensual, formatCOP } from "@/lib/finance";
import { exportarCSV } from "@/utils/export";
import type { FormularioCredito } from "@/types";

const WHATSAPP_NUMBER = "573103917469";
const WHATSAPP_MSG = encodeURIComponent(
  "Hola, vi tu simulador de créditos y me gustó. Tengo una idea para una página web/app y quisiera contártela."
);
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`;

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

export default function Home() {
  const [form, setForm] = useState<FormularioCredito>(FORM_INICIAL);

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
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

            {/* Izquierda: título */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                Simulador de Créditos
                <span className="block text-blue-400">Colombia</span>
              </h1>
              <p className="mt-2 text-slate-400 text-sm max-w-md leading-relaxed">
                Calcula cuotas, intereses, seguros y tabla de amortización en segundos.
              </p>
            </div>

            {/* Derecha: jbenavides.dev + WhatsApp */}
            <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
              <div className="sm:text-right">
                <p className="text-slate-500 text-xs font-medium">Desarrollado por</p>
                <p className="text-white font-bold text-base tracking-tight">jbenavides.dev</p>
                <p className="text-blue-400 text-xs mt-0.5">Convertimos ideas en productos digitales</p>
              </div>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 active:scale-[0.98]
                           text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-150
                           shadow-lg shadow-green-900/30"
              >
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.845L.072 23.928l6.258-1.641A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 01-5.001-1.371l-.36-.213-3.714.974.99-3.617-.234-.372A9.778 9.778 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                </svg>
                💡 ¿Tienes una idea en mente?
              </a>
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8">

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
                  <li key={e} className="text-sm text-red-600 flex items-center gap-1.5">
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
            <CreditForm form={form} onChange={setForm} onReset={handleReset} />
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
                    <span className="font-bold">{formatCOP(form.valorCredito)}</span>{" "}
                    a <span className="font-bold">{form.plazoMeses} meses</span>, pagarías aproximadamente{" "}
                    <span className="font-bold text-emerald-300">{formatCOP(lecturaRapida.cuotaTotal)}/mes</span>{" "}
                    y un total de <span className="font-bold">{formatCOP(resumen.totalPagado)}</span>.{" "}
                    Los intereses representan el{" "}
                    <span className="font-bold text-yellow-300">{lecturaRapida.pctIntereses}%</span>{" "}
                    del valor solicitado y el costo adicional equivale al{" "}
                    <span className="font-bold text-orange-300">{lecturaRapida.pctCosto}%</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tabla ── */}
        {listo && resumen && (
          <div className="mt-6 animate-fade-up">
            <AmortizationTable tabla={resumen.tabla} onExportCSV={handleExportCSV} />
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 mt-16 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-7">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-700">Simulador de Créditos Colombia</span>
              </div>
              <p className="text-xs text-slate-400">Herramienta informativa. Los valores reales pueden variar.</p>
            </div>
            <div className="flex flex-col sm:items-end gap-3">
              <div className="sm:text-right">
                <p className="text-sm font-bold text-slate-800">jbenavides.dev</p>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xs sm:text-right leading-relaxed">
                  Creamos soluciones tecnológicas para emprendedores y negocios: webs, apps y automatización que generan resultados reales.
                </p>
              </div>
              <div className="flex flex-col sm:items-end gap-1.5">
                <p className="text-xs font-semibold text-slate-600 italic">
                  💡 Cuéntame tu idea y juntos la hacemos realidad.
                </p>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold
                             px-4 py-2.5 rounded-xl transition-all duration-150 shadow-sm"
                >
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.845L.072 23.928l6.258-1.641A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 01-5.001-1.371l-.36-.213-3.714.974.99-3.617-.234-.372A9.778 9.778 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                  </svg>
                  Escríbeme por WhatsApp
                </a>
              </div>
            </div>
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
  );
}
