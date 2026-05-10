import type {
  FormularioCredito,
  FilaAmortizacion,
  ResumenFinanciero,
} from "@/types";

export function convertirTasaMensual(tasa: number, tipo: FormularioCredito["tipoTasa"]): number {
  if (tipo === "nominal_mensual") return tasa / 100;
  // efectiva_anual: convertir a tasa mensual equivalente
  return Math.pow(1 + tasa / 100, 1 / 12) - 1;
}

export function calcularCuotaFrancesa(P: number, i: number, n: number): number {
  if (i === 0) return P / n;
  const factor = Math.pow(1 + i, n);
  return (P * i * factor) / (factor - 1);
}

export function calcularAbonoFijoCapital(P: number, n: number): number {
  return P / n;
}

export function formatCOP(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

export function formatPorcentaje(valor: number): string {
  return `${valor.toFixed(4)}%`;
}

export function calcularResumen(form: FormularioCredito): ResumenFinanciero | null {
  const { valorCredito, plazoMeses, tasa, tipoTasa, sistemaAmortizacion, tipoSeguro, valorSeguro, otrosCostos } = form;

  if (valorCredito <= 0 || plazoMeses <= 0 || tasa < 0) return null;

  const i = convertirTasaMensual(tasa, tipoTasa);
  if (!isFinite(i) || isNaN(i)) return null;

  const n = plazoMeses;

  const cuotaBase =
    sistemaAmortizacion === "frances"
      ? calcularCuotaFrancesa(valorCredito, i, n)
      : calcularAbonoFijoCapital(valorCredito, n);

  if (!isFinite(cuotaBase) || isNaN(cuotaBase)) return null;

  // Costos únicos al inicio
  const costosIniciales = otrosCostos
    .filter((c) => c.frecuencia === "unica_vez")
    .reduce((acc, c) => acc + c.valor, 0);

  // Costos mensuales fijos
  const costosMensualesFijos = otrosCostos
    .filter((c) => c.frecuencia === "mensual")
    .reduce((acc, c) => acc + c.valor, 0);

  const tabla: FilaAmortizacion[] = [];
  let saldo = valorCredito;
  let totalIntereses = 0;
  let totalSeguros = 0;
  let totalOtrosCostos = costosIniciales;

  for (let cuota = 1; cuota <= n; cuota++) {
    const saldoInicial = saldo;
    const interesPeriodo = saldo * i;

    let abonoCapital: number;
    let cuotaBaseEfectiva: number;

    if (sistemaAmortizacion === "frances") {
      cuotaBaseEfectiva = cuotaBase;
      abonoCapital = cuotaBaseEfectiva - interesPeriodo;
    } else {
      abonoCapital = cuotaBase;
      cuotaBaseEfectiva = abonoCapital + interesPeriodo;
    }

    // Seguro
    let seguro = 0;
    if (tipoSeguro === "fijo") {
      seguro = valorSeguro;
    } else {
      seguro = saldoInicial * (valorSeguro / 100);
    }

    const otrosCostosMensuales = costosMensualesFijos;
    const cuotaTotal = cuotaBaseEfectiva + seguro + otrosCostosMensuales;

    const saldoFinal = Math.max(0, saldo - abonoCapital);

    tabla.push({
      numeroCuota: cuota,
      saldoInicial,
      cuotaBase: cuotaBaseEfectiva,
      interesPeriodo,
      abonoCapital,
      seguro,
      otrosCostosMensuales,
      cuotaTotal,
      saldoFinal,
    });

    totalIntereses += interesPeriodo;
    totalSeguros += seguro;
    totalOtrosCostos += otrosCostosMensuales;
    saldo = saldoFinal;
  }

  const totalPagado =
    tabla.reduce((acc, f) => acc + f.cuotaTotal, 0) + costosIniciales;
  const costoTotalCredito = totalPagado - valorCredito;
  const diferenciaSolicitadoVsPagado = totalPagado - valorCredito;

  return {
    cuotaMensualBase: cuotaBase,
    totalIntereses,
    totalSeguros,
    totalOtrosCostos,
    totalPagado,
    costoTotalCredito,
    diferenciaSolicitadoVsPagado,
    costosIniciales,
    tabla,
  };
}
