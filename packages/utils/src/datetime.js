"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agoraBrasilia = agoraBrasilia;
exports.paraZonaBrasilia = paraZonaBrasilia;
exports.brasiliaPraUtc = brasiliaPraUtc;
exports.formatarDataBrasilia = formatarDataBrasilia;
exports.formatarDataHoraBrasilia = formatarDataHoraBrasilia;
const date_fns_tz_1 = require("date-fns-tz");
const FUSO_BRASILIA = 'America/Sao_Paulo';
/**
 * Retorna a data/hora atual no fuso America/Sao_Paulo.
 * Use sempre esta função em vez de `new Date()` em código de produção.
 */
function agoraBrasilia() {
    return (0, date_fns_tz_1.toZonedTime)(new Date(), FUSO_BRASILIA);
}
/**
 * Converte qualquer Date para o fuso America/Sao_Paulo.
 */
function paraZonaBrasilia(data) {
    return (0, date_fns_tz_1.toZonedTime)(data, FUSO_BRASILIA);
}
/**
 * Converte uma data no fuso Brasília para UTC (para persistência quando necessário).
 */
function brasiliaPraUtc(data) {
    return (0, date_fns_tz_1.fromZonedTime)(data, FUSO_BRASILIA);
}
/**
 * Formata uma Date usando o fuso America/Sao_Paulo.
 * @param data - Date a ser formatada
 * @param padrao - Padrão date-fns (ex: 'dd/MM/yyyy HH:mm:ss')
 */
function formatarDataBrasilia(data, padrao) {
    return (0, date_fns_tz_1.format)((0, date_fns_tz_1.toZonedTime)(data, FUSO_BRASILIA), padrao, {
        timeZone: FUSO_BRASILIA,
    });
}
/**
 * Retorna o timestamp atual como string ISO-like no fuso Brasília.
 * Formato: yyyy-MM-dd'T'HH:mm:ss
 */
function formatarDataHoraBrasilia(data) {
    return (0, date_fns_tz_1.format)((0, date_fns_tz_1.toZonedTime)(data, FUSO_BRASILIA), "yyyy-MM-dd'T'HH:mm:ss", {
        timeZone: FUSO_BRASILIA,
    });
}
//# sourceMappingURL=datetime.js.map