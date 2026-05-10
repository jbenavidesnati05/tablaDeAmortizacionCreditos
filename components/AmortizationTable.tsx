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
    <div className="card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Tabla de Amortización</h2>
          <p className="text-xs text-slate-500 mt-0.5">{tabla.length} cuotas en total</p>
        </div>
        <button onClick={onExportCSV} className="btn-secondary text-xs">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="table-th">#</th>
              <th className="table-th">Saldo inicial</th>
              <th className="table-th">Cuota base</th>
              <th className="table-th">Interés</th>
              <th className="table-th">Abono capital</th>
              <th className="table-th">Seguro</th>
              <th className="table-th">Otros costos</th>
              <th className="table-th font-bold text-slate-700">Cuota total</th>
              <th className="table-th">Saldo final</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, idx) => (
              <tr
                key={fila.numeroCuota}
                className={`border-b border-slate-50 hover:bg-blue-50/30 transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                }`}
              >
                <td className="table-td font-semibold text-blue-600">{fila.numeroCuota}</td>
                <td className="table-td text-slate-600">{formatCOP(fila.saldoInicial)}</td>
                <td className="table-td">{formatCOP(fila.cuotaBase)}</td>
                <td className="table-td text-orange-600">{formatCOP(fila.interesPeriodo)}</td>
                <td className="table-td text-green-600">{formatCOP(fila.abonoCapital)}</td>
                <td className="table-td text-purple-600">{formatCOP(fila.seguro)}</td>
                <td className="table-td text-teal-600">{formatCOP(fila.otrosCostosMensuales)}</td>
                <td className="table-td font-bold text-slate-800">{formatCOP(fila.cuotaTotal)}</td>
                <td className="table-td text-slate-500">{formatCOP(fila.saldoFinal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 border-t-2 border-slate-200">
            <tr>
              <td className="table-td font-bold text-slate-700 uppercase text-xs">Total</td>
              <td className="table-td" />
              <td className="table-td font-bold">{formatCOP(tabla.reduce((a, f) => a + f.cuotaBase, 0))}</td>
              <td className="table-td font-bold text-orange-600">{formatCOP(tabla.reduce((a, f) => a + f.interesPeriodo, 0))}</td>
              <td className="table-td font-bold text-green-600">{formatCOP(tabla.reduce((a, f) => a + f.abonoCapital, 0))}</td>
              <td className="table-td font-bold text-purple-600">{formatCOP(tabla.reduce((a, f) => a + f.seguro, 0))}</td>
              <td className="table-td font-bold text-teal-600">{formatCOP(tabla.reduce((a, f) => a + f.otrosCostosMensuales, 0))}</td>
              <td className="table-td font-bold text-slate-800">{formatCOP(tabla.reduce((a, f) => a + f.cuotaTotal, 0))}</td>
              <td className="table-td" />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
          <p className="text-xs text-slate-500">
            Mostrando {inicio + 1}–{Math.min(inicio + PAGE_SIZE, tabla.length)} de {tabla.length} cuotas
          </p>
          <div className="flex items-center gap-1">
            <PaginaBtn disabled={pagina === 1} onClick={() => setPagina(1)}>«</PaginaBtn>
            <PaginaBtn disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>‹</PaginaBtn>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 1)
              .map((p, i, arr) => (
                <>
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span key={`ellipsis-${p}`} className="px-2 text-slate-400 text-sm">…</span>
                  )}
                  <PaginaBtn key={p} active={p === pagina} onClick={() => setPagina(p)}>{p}</PaginaBtn>
                </>
              ))}
            <PaginaBtn disabled={pagina === totalPaginas} onClick={() => setPagina(p => p + 1)}>›</PaginaBtn>
            <PaginaBtn disabled={pagina === totalPaginas} onClick={() => setPagina(totalPaginas)}>»</PaginaBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function PaginaBtn({
  children,
  onClick,
  disabled,
  active,
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
      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
        active
          ? "bg-blue-600 text-white"
          : disabled
          ? "text-slate-300 cursor-not-allowed"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}
