"use client";

import { formatCOP } from "@/lib/finance";
import type { ResumenFinanciero, FormularioCredito } from "@/types";

interface Props {
  resumen: ResumenFinanciero;
  form: FormularioCredito;
  tasaMensual: number;
}

export default function SummaryCards({ resumen, form, tasaMensual }: Props) {
  const esFrances = form.sistemaAmortizacion === "frances";
  const primeraFila = resumen.tabla[0];
  const cuotaTotalMes = primeraFila?.cuotaTotal ?? resumen.cuotaMensualBase;
  const pctCapital = (form.valorCredito / resumen.totalPagado) * 100;
  const pctIntereses = (resumen.totalIntereses / resumen.totalPagado) * 100;
  const pctOtros = 100 - pctCapital - pctIntereses;
  const eaEquivalente = (Math.pow(1 + tasaMensual, 12) - 1) * 100;

  return (
    <div className="space-y-4">

      {/* ── Cuota principal ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-lg shadow-blue-200">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative">
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">
            {esFrances ? "Cuota mensual fija" : "Primera cuota estimada"}
          </p>
          <p className="text-5xl font-bold tracking-tight">
            {formatCOP(cuotaTotalMes)}
          </p>
          <p className="text-blue-300 text-xs mt-2">
            {esFrances
              ? "Valor constante durante todo el crédito"
              : "La cuota disminuye cada mes al reducirse el saldo"}
            {form.valorSeguro > 0 ? " · Incluye seguro" : ""}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-px bg-white/10 rounded-xl overflow-hidden">
            {[
              { label: "Capital", value: formatCOP(primeraFila?.abonoCapital ?? 0), color: "text-cyan-300" },
              { label: "Interés", value: formatCOP(primeraFila?.interesPeriodo ?? 0), color: "text-orange-300" },
              { label: "Seguro", value: formatCOP(primeraFila?.seguro ?? 0), color: "text-purple-300" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 px-3 py-3 text-center">
                <p className="text-[10px] text-blue-300 uppercase tracking-wide mb-0.5">{stat.label}</p>
                <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tasa efectiva ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card py-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Tasa mensual efectiva</p>
          <p className="text-2xl font-bold text-slate-900">{(tasaMensual * 100).toFixed(4)}%</p>
          <p className="text-xs text-slate-400 mt-1">
            = {eaEquivalente.toFixed(2)}% E.A. anual
          </p>
        </div>
        <div className="card py-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Plazo del crédito</p>
          <p className="text-2xl font-bold text-slate-900">{form.plazoMeses}</p>
          <p className="text-xs text-slate-400 mt-1">
            meses {form.plazoMeses >= 12 ? `· ${(form.plazoMeses / 12).toFixed(1)} años` : ""}
          </p>
        </div>
      </div>

      {/* ── Grid de costos ── */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon="📈"
          label="Total intereses"
          value={formatCOP(resumen.totalIntereses)}
          sub={`${((resumen.totalIntereses / form.valorCredito) * 100).toFixed(1)}% del capital`}
          accent="orange"
        />
        <MetricCard
          icon="🛡️"
          label="Total seguros"
          value={formatCOP(resumen.totalSeguros)}
          sub="Acumulado en el plazo"
          accent="purple"
        />
        <MetricCard
          icon="📋"
          label="Costos al inicio"
          value={formatCOP(resumen.costosIniciales)}
          sub="Pagos únicos iniciales"
          accent="slate"
        />
        <MetricCard
          icon="🔄"
          label="Costos mensuales"
          value={formatCOP(resumen.totalOtrosCostos - resumen.costosIniciales)}
          sub="Cargos acumulados"
          accent="teal"
        />
      </div>

      {/* ── Total pagado ── */}
      <div className="rounded-2xl bg-slate-900 p-5 text-white">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Total pagado al finalizar</p>
            <p className="text-3xl font-bold">{formatCOP(resumen.totalPagado)}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Costo real del crédito</p>
            <p className="text-xl font-bold text-red-400">{formatCOP(resumen.costoTotalCredito)}</p>
          </div>
        </div>

        <div className="space-y-1.5 text-sm border-t border-slate-700/60 pt-4 mb-4">
          <div className="flex justify-between">
            <span className="text-slate-400">Capital prestado</span>
            <span className="font-semibold text-emerald-400">{formatCOP(form.valorCredito)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Intereses totales</span>
            <span className="font-semibold text-orange-400">+ {formatCOP(resumen.totalIntereses)}</span>
          </div>
          {resumen.totalSeguros > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-400">Seguros totales</span>
              <span className="font-semibold text-purple-400">+ {formatCOP(resumen.totalSeguros)}</span>
            </div>
          )}
          {resumen.totalOtrosCostos > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-400">Otros costos</span>
              <span className="font-semibold text-slate-300">+ {formatCOP(resumen.totalOtrosCostos)}</span>
            </div>
          )}
        </div>

        {/* Barra de composición */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Composición del total pagado</span>
            <span>Capital {pctCapital.toFixed(0)}%</span>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden gap-px">
            <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${pctCapital}%` }} />
            <div className="bg-orange-400 transition-all duration-700" style={{ width: `${pctIntereses}%` }} />
            {pctOtros > 0.5 && (
              <div className="bg-purple-400 transition-all duration-700" style={{ width: `${pctOtros}%` }} />
            )}
          </div>
          <div className="flex gap-4 mt-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Capital</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> Intereses</span>
            {pctOtros > 0.5 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> Seguros/otros</span>}
          </div>
        </div>
      </div>

      {/* ── Nota informativa ── */}
      <div className="flex gap-3 bg-amber-50 border border-amber-200/70 rounded-xl p-4">
        <span className="text-amber-500 text-lg shrink-0">⚠️</span>
        <div>
          <p className="text-xs font-semibold text-amber-800 mb-0.5">Simulación informativa</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Este simulador es una herramienta educativa. Los valores reales pueden variar según la entidad financiera, seguros, comisiones, políticas internas y condiciones del crédito.
          </p>
        </div>
      </div>
    </div>
  );
}

const accentMap = {
  orange: { bg: "bg-orange-50",  border: "border-orange-100", text: "text-orange-700",  sub: "text-orange-500/70"  },
  purple: { bg: "bg-purple-50",  border: "border-purple-100", text: "text-purple-700",  sub: "text-purple-500/70"  },
  teal:   { bg: "bg-teal-50",    border: "border-teal-100",   text: "text-teal-700",    sub: "text-teal-500/70"    },
  slate:  { bg: "bg-slate-50",   border: "border-slate-200",  text: "text-slate-700",   sub: "text-slate-400"      },
};

function MetricCard({
  icon, label, value, sub, accent,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  accent: keyof typeof accentMap;
}) {
  const c = accentMap[accent];
  return (
    <div className={`rounded-xl border p-4 ${c.bg} ${c.border}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`text-[11px] font-semibold uppercase tracking-wide ${c.text} opacity-70`}>{label}</p>
      <p className={`text-base font-bold mt-0.5 ${c.text}`}>{value}</p>
      <p className={`text-[11px] mt-0.5 ${c.sub}`}>{sub}</p>
    </div>
  );
}
