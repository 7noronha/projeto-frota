/**
 * Retorna a data/hora atual no fuso America/Sao_Paulo.
 * Use sempre esta função em vez de `new Date()` em código de produção.
 */
export declare function agoraBrasilia(): Date;
/**
 * Converte qualquer Date para o fuso America/Sao_Paulo.
 */
export declare function paraZonaBrasilia(data: Date): Date;
/**
 * Converte uma data no fuso Brasília para UTC (para persistência quando necessário).
 */
export declare function brasiliaPraUtc(data: Date): Date;
/**
 * Formata uma Date usando o fuso America/Sao_Paulo.
 * @param data - Date a ser formatada
 * @param padrao - Padrão date-fns (ex: 'dd/MM/yyyy HH:mm:ss')
 */
export declare function formatarDataBrasilia(data: Date, padrao: string): string;
/**
 * Retorna o timestamp atual como string ISO-like no fuso Brasília.
 * Formato: yyyy-MM-dd'T'HH:mm:ss
 */
export declare function formatarDataHoraBrasilia(data: Date): string;
//# sourceMappingURL=datetime.d.ts.map