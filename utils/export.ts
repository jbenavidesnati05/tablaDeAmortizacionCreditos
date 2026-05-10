import type { FilaAmortizacion } from "@/types";
import { formatCOP } from "@/lib/finance";

export function exportarCSV(tabla: FilaAmortizacion[], nombreArchivo = "amortizacion.csv") {
  const headers = [
    "Cuota",
    "Saldo inicial",
    "Cuota base",
    "Interés",
    "Abono capital",
    "Seguro",
    "Otros costos",
    "Cuota total",
    "Saldo final",
  ];

  const filas = tabla.map((f) => [
    f.numeroCuota,
    f.saldoInicial.toFixed(2),
    f.cuotaBase.toFixed(2),
    f.interesPeriodo.toFixed(2),
    f.abonoCapital.toFixed(2),
    f.seguro.toFixed(2),
    f.otrosCostosMensuales.toFixed(2),
    f.cuotaTotal.toFixed(2),
    f.saldoFinal.toFixed(2),
  ]);

  const csvContent = [headers, ...filas]
    .map((row) => row.join(";"))
    .join("\n");

  const bom = "﻿"; // UTF-8 BOM para Excel en español
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  link.click();
  URL.revokeObjectURL(url);
}
