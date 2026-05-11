"use client";

import { useState } from "react";
import { formatCOP } from "@/lib/finance";
import type { FilaAmortizacion } from "@/types";

interface Props {
  tabla: FilaAmortizacion[];
  onExportCSV: () => void;
}

const PAGE_SIZE = 24;

export default function AmortizationTable({ tabla, onExportCSV }: Props) {
  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.ceil(tabla.length / PAGE_SIZE);
  const inicio = (pagina - 1) * PAGE_SIZE;
  const filas = tabla.slice(inicio, inicio + PAGE_SIZE);

  return (
    <div className="card p-0 overflow-hidden">

      {/* Cabecera de la tabla */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Detalle de cuotas</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Consulta cómo se distribuye cada pago entre intereses, capital, seguros y costos.
                <span className="ml-1 font-medium text-slate-500">{tabla.length} cuotas en total.</span>
              </p>
            </div>
          </div>
          <button onClick={onExportCSV} className="btn-secondary text-xs py-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar en Excel
          </button>
        </div>

        {/* Leyenda de colores */}
        <div className="flex flex-wrap gap-3 mt-4">
          {[
            { color: "bg-orange-400", label: "Interés" },
            { color: "bg-emerald-500", label: "Capital" },
            { color: "bg-purple-400", label: "Seguro" },
            { color: "bg-teal-400", label: "Otros costos" },
            { color: "bg-slate-800", label: "Cuota total" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`w-2 h-2 rounded-full ${l.color}`} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="table-th">#</th>
              <th className="table-th">Saldo inicial</th>
              <th className="table-th">Cuota base</th>
              <th className="table-th text-orange-600">Interés</th>
              <th className="table-th text-emerald-600">Capital</th>
              <th className="table-th text-purple-600">Seguro</th>
              <th className="table-th text-teal-600">Otros</th>
              <th className="table-th text-slate-900 font-bold">Cuota total</th>
              <th className="table-th">Saldo final</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, idx) => (
              <tr
                key={fila.numeroCuota}
                className={`border-b border-slate-50 transition-colors hover:bg-blue-50/40 ${
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                }`}
              >
                <td className="table-td">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold">
                    {fila.numeroCuota}
                  </span>
                </td>
                <td className="table-td text-slate-500">{formatCOP(fila.saldoInicial)}</td>
                <td className="table-td font-medium text-slate-700">{formatCOP(fila.cuotaBase)}</td>
                <td className="table-td font-medium text-orange-600">{formatCOP(fila.interesPeriodo)}</td>
                <td className="table-td font-medium text-emerald-600">{formatCOP(fila.abonoCapital)}</td>
                <td className="table-td text-purple-600">{formatCOP(fila.seguro)}</td>
                <td className="table-td text-teal-600">{formatCOP(fila.otrosCostosMensuales)}</td>
                <td className="table-td font-bold text-slate-900">{formatCOP(fila.cuotaTotal)}</td>
                <td className="table-td text-slate-400">{formatCOP(fila.saldoFinal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 border-t-2 border-slate-200">
              <td className="table-td font-bold text-slate-600 text-xs uppercase tracking-wide" colSpan={2}>
                Totales
              </td>
              <td className="table-td font-bold text-slate-700">{formatCOP(tabla.reduce((a, f) => a + f.cuotaBase, 0))}</td>
              <td className="table-td font-bold text-orange-600">{formatCOP(tabla.reduce((a, f) => a + f.interesPeriodo, 0))}</td>
              <td className="table-td font-bold text-emerald-600">{formatCOP(tabla.reduce((a, f) => a + f.abonoCapital, 0))}</td>
              <td className="table-td font-bold text-purple-600">{formatCOP(tabla.reduce((a, f) => a + f.seguro, 0))}</td>
              <td className="table-td font-bold text-teal-600">{formatCOP(tabla.reduce((a, f) => a + f.otrosCostosMensuales, 0))}</td>
              <td className="table-td font-bold text-slate-900">{formatCOP(tabla.reduce((a, f) => a + f.cuotaTotal, 0))}</td>
              <td className="table-td" />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-slate-400">
            Mostrando <span className="font-semibold text-slate-600">{inicio + 1}–{Math.min(inicio + PAGE_SIZE, tabla.length)}</span> de{" "}
            <span className="font-semibold text-slate-600">{tabla.length}</span> cuotas
          </p>
          <div className="flex items-center gap-1">
            <NavBtn disabled={pagina === 1} onClick={() => setPagina(1)}>«</NavBtn>
            <NavBtn disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)}>‹</NavBtn>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 1)
              .map((p, i, arr) => (
                <span key={p}>
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span className="px-1.5 text-slate-400 text-sm select-none">…</span>
                  )}
                  <NavBtn active={p === pagina} onClick={() => setPagina(p)}>{p}</NavBtn>
                </span>
              ))}
            <NavBtn disabled={pagina === totalPaginas} onClick={() => setPagina((p) => p + 1)}>›</NavBtn>
            <NavBtn disabled={pagina === totalPaginas} onClick={() => setPagina(totalPaginas)}>»</NavBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({
  children, onClick, disabled, active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-150 ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : disabled
          ? "text-slate-300 cursor-not-allowed"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}
