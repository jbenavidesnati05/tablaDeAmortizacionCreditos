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

  return (
    <div className="space-y-4">
      {/* Cuota destacada */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">
          {esFrances ? "Cuota mensual fija" : "Primera cuota estimada"}
        </p>
        <p className="text-4xl font-bold tracking-tight">{formatCOP(resumen.cuotaMensualBase + (resumen.tabla[0]?.seguro ?? 0) + (resumen.tabla[0]?.otrosCostosMensuales ?? 0))}</p>
        <p className="text-blue-200 text-xs mt-2">
          Incluye intereses{form.valorSeguro > 0 ? ", seguro" : ""}
          {form.otrosCostos.some(c => c.frecuencia === "mensual") ? " y costos mensuales" : ""}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-blue-500/40 pt-4">
          <MiniStat label="Capital" value={formatCOP(resumen.tabla[0]?.abonoCapital ?? 0)} />
          <MiniStat label="Interés" value={formatCOP(resumen.tabla[0]?.interesPeriodo ?? 0)} />
          <MiniStat label="Seguro" value={formatCOP(resumen.tabla[0]?.seguro ?? 0)} />
        </div>
      </div>

      {/* Tasa efectiva mensual */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Tasa mensual efectiva utilizada</p>
        <p className="text-2xl font-bold text-slate-800">{(tasaMensual * 100).toFixed(4)}%</p>
        <p className="text-xs text-slate-500 mt-1">
          Equivale a {((Math.pow(1 + tasaMensual, 12) - 1) * 100).toFixed(2)}% E.A.
        </p>
      </div>

      {/* Grid de resumen */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          label="Total intereses"
          value={formatCOP(resumen.totalIntereses)}
          icon="📈"
          color="orange"
        />
        <SummaryCard
          label="Total seguros"
          value={formatCOP(resumen.totalSeguros)}
          icon="🛡️"
          color="green"
        />
        <SummaryCard
          label="Costos iniciales"
          value={formatCOP(resumen.costosIniciales)}
          icon="📋"
          color="purple"
        />
        <SummaryCard
          label="Costos mensuales acum."
          value={formatCOP(resumen.totalOtrosCostos - resumen.costosIniciales)}
          icon="🔄"
          color="teal"
        />
      </div>

      {/* Total pagado */}
      <div className="bg-slate-800 rounded-2xl p-5 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Total pagado al final</p>
            <p className="text-3xl font-bold">{formatCOP(resumen.totalPagado)}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Costo del crédito</p>
            <p className="text-xl font-bold text-red-400">{formatCOP(resumen.costoTotalCredito)}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Valor solicitado</span>
            <span className="font-semibold">{formatCOP(form.valorCredito)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-slate-400">Diferencia (intereses + costos)</span>
            <span className="font-semibold text-red-400">+ {formatCOP(resumen.diferenciaSolicitadoVsPagado)}</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Capital</span>
              <span>{((form.valorCredito / resumen.totalPagado) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(form.valorCredito / resumen.totalPagado) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
        <p className="font-semibold mb-1">⚠️ Nota informativa</p>
        <p>
          Este simulador es una herramienta informativa. Los valores reales pueden variar según la entidad
          financiera, seguros, comisiones, políticas internas y condiciones del crédito.
        </p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-blue-200 text-xs">{label}</p>
      <p className="text-white font-semibold text-sm">{value}</p>
    </div>
  );
}

const colorMap = {
  orange: "bg-orange-50 border-orange-100 text-orange-700",
  green: "bg-green-50 border-green-100 text-green-700",
  purple: "bg-purple-50 border-purple-100 text-purple-700",
  teal: "bg-teal-50 border-teal-100 text-teal-700",
};

function SummaryCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: keyof typeof colorMap }) {
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <p className="text-xl mb-1">{icon}</p>
      <p className="text-xs font-semibold opacity-70 uppercase tracking-wide">{label}</p>
      <p className="text-base font-bold mt-1">{value}</p>
    </div>
  );
}
