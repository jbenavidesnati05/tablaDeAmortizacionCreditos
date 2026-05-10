export type TipoTasa = "efectiva_anual" | "nominal_mensual";
export type SistemaAmortizacion = "frances" | "abono_fijo";
export type TipoSeguro = "fijo" | "porcentaje_saldo";
export type FrecuenciaCosto = "unica_vez" | "mensual";

export interface OtroCosto {
  id: string;
  nombre: string;
  valor: number;
  frecuencia: FrecuenciaCosto;
}

export interface FormularioCredito {
  valorCredito: number;
  plazoMeses: number;
  tasa: number;
  tipoTasa: TipoTasa;
  sistemaAmortizacion: SistemaAmortizacion;
  tipoSeguro: TipoSeguro;
  valorSeguro: number;
  otrosCostos: OtroCosto[];
}

export interface FilaAmortizacion {
  numeroCuota: number;
  saldoInicial: number;
  cuotaBase: number;
  interesPeriodo: number;
  abonoCapital: number;
  seguro: number;
  otrosCostosMensuales: number;
  cuotaTotal: number;
  saldoFinal: number;
}

export interface ResumenFinanciero {
  cuotaMensualBase: number;
  totalIntereses: number;
  totalSeguros: number;
  totalOtrosCostos: number;
  totalPagado: number;
  costoTotalCredito: number;
  diferenciaSolicitadoVsPagado: number;
  costosIniciales: number;
  tabla: FilaAmortizacion[];
}
