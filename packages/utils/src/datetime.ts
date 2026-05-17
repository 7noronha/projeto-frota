import { toZonedTime, format, fromZonedTime } from 'date-fns-tz';

const FUSO_BRASILIA = 'America/Sao_Paulo';

/**
 * Retorna a data/hora atual no fuso America/Sao_Paulo.
 * Use sempre esta função em vez de `new Date()` em código de produção.
 */
export function agoraBrasilia(): Date {
  return toZonedTime(new Date(), FUSO_BRASILIA);
}

/**
 * Converte qualquer Date para o fuso America/Sao_Paulo.
 */
export function paraZonaBrasilia(data: Date): Date {
  return toZonedTime(data, FUSO_BRASILIA);
}

/**
 * Converte uma data no fuso Brasília para UTC (para persistência quando necessário).
 */
export function brasiliaPraUtc(data: Date): Date {
  return fromZonedTime(data, FUSO_BRASILIA);
}

/**
 * Formata uma Date usando o fuso America/Sao_Paulo.
 * @param data - Date a ser formatada
 * @param padrao - Padrão date-fns (ex: 'dd/MM/yyyy HH:mm:ss')
 */
export function formatarDataBrasilia(data: Date, padrao: string): string {
  return format(toZonedTime(data, FUSO_BRASILIA), padrao, {
    timeZone: FUSO_BRASILIA,
  });
}

/**
 * Retorna o timestamp atual como string ISO-like no fuso Brasília.
 * Formato: yyyy-MM-dd'T'HH:mm:ss
 */
export function formatarDataHoraBrasilia(data: Date): string {
  return format(toZonedTime(data, FUSO_BRASILIA), "yyyy-MM-dd'T'HH:mm:ss", {
    timeZone: FUSO_BRASILIA,
  });
}
