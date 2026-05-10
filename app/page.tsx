"use client";

import { useState, useMemo } from "react";
import CreditForm from "@/components/CreditForm";
import SummaryCards from "@/components/SummaryCards";
import AmortizationTable from "@/components/AmortizationTable";
import { calcularResumen, convertirTasaMensual } from "@/lib/finance";
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

  function handleReset() {
    setForm(FORM_INICIAL);
  }

  function handleExportCSV() {
    if (resumen) exportarCSV(resumen.tabla);
  }

  const listo = resumen !== null && errores.length === 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Simulador de Créditos</h1>
              <p className="text-blue-200 text-xs sm:text-sm">Colombia · Sistema Financiero · Tabla de Amortización</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Errores de validación */}
        {errores.length > 0 && form.valorCredito > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-700 mb-2">Por favor corrige los siguientes errores:</p>
            <ul className="list-disc list-inside space-y-1">
              {errores.map((e) => (
                <li key={e} className="text-sm text-red-600">{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario - 1 columna */}
          <div className="lg:col-span-1">
            <CreditForm form={form} onChange={setForm} onReset={handleReset} />
          </div>

          {/* Resumen - 2 columnas */}
          <div className="lg:col-span-2">
            {listo ? (
              <SummaryCards resumen={resumen} form={form} tasaMensual={tasaMensual} />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        {/* Tabla de amortización */}
        {listo && resumen && (
          <div className="mt-8">
            <AmortizationTable tabla={resumen.tabla} onExportCSV={handleExportCSV} />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-400">
        <p>Simulador de Créditos Colombia · Solo fines informativos · Los resultados no constituyen una oferta financiera</p>
      </footer>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card h-full min-h-64 flex flex-col items-center justify-center text-center gap-4">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
        <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div>
        <p className="text-slate-700 font-semibold text-lg">Ingresa los datos del crédito</p>
        <p className="text-slate-400 text-sm mt-1 max-w-xs">
          Completa el formulario a la izquierda para ver el resumen financiero y la tabla de amortización.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-2 text-xs text-slate-400">
        {["Cuota mensual", "Total intereses", "Tabla de cuotas"].map((item) => (
          <div key={item} className="bg-slate-50 rounded-xl p-3">
            <div className="w-8 h-2 bg-slate-200 rounded mx-auto mb-2" />
            <p>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
