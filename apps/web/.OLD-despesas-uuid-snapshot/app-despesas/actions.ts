'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchServidor, ErroApi } from '@/lib/api-servidor';
import type { RespostaPaginada } from '@fleetops/types';

export type TipoDespesa =
  | 'multa'
  | 'abastecimento'
  | 'manutencao'
  | 'imposto'
  | 'seguro'
  | 'documentacao';
export type TipoCombustivel = 'gasolina' | 'etanol' | 'diesel' | 'gnv' | 'flex';
export type TipoManutencao = 'preventiva' | 'corretiva';
export type GravidadeMulta = 'leve' | 'media' | 'grave' | 'gravissima';
export type TipoImposto = 'ipva' | 'licenciamento' | 'dpvat' | 'outro';
export type CoberturaSeguro = 'total' | 'terceiros' | 'compreensiva';
export type TipoDocumento =
  | 'crlv'
  | 'transferencia'
  | 'vistoria'
  | 'emplacamento'
  | 'outro';

export interface Despesa {
  id: string;
  veiculoId: string;
  tipo: TipoDespesa;
  data: string;
  valor: number;
  descricao: string;
  observacoes: string | null;
  odometro: number | null;
  litros: number | null;
  precoLitro: number | null;
  tipoCombustivel: TipoCombustivel | null;
  tipoManutencao: TipoManutencao | null;
  oficina: string | null;
  numeroAuto: string | null;
  gravidade: GravidadeMulta | null;
  pontosCnh: number | null;
  dataVencimento: string | null;
  tipoImposto: TipoImposto | null;
  anoExercicio: number | null;
  numeroParcela: number | null;
  totalParcelas: number | null;
  seguradora: string | null;
  numeroApolice: string | null;
  vigenciaInicio: string | null;
  vigenciaFim: string | null;
  coberturaTipo: CoberturaSeguro | null;
  tipoDocumento: TipoDocumento | null;
  dataCriacao: string;
}

interface FiltrosDespesas {
  tipo?: TipoDespesa;
  dataInicio?: string;
  dataFim?: string;
}

export async function buscarDespesas(
  veiculoId: string,
  pagina = 1,
  filtros: FiltrosDespesas = {},
): Promise<RespostaPaginada<Despesa>> {
  const params = new URLSearchParams({
    veiculoId,
    pagina: String(pagina),
    tamanhoPagina: '50',
  });
  if (filtros.tipo) params.set('tipo', filtros.tipo);
  if (filtros.dataInicio) params.set('dataInicio', filtros.dataInicio);
  if (filtros.dataFim) params.set('dataFim', filtros.dataFim);

  return fetchServidor<RespostaPaginada<Despesa>>(`/despesas?${params}`);
}

export async function buscarDespesaPorId(id: string): Promise<Despesa> {
  return fetchServidor<Despesa>(`/despesas/${id}`);
}

function montarCorpo(veiculoId: string, formData: FormData): Record<string, unknown> {
  const tipo = String(formData.get('tipo') ?? '');
  const corpo: Record<string, unknown> = {
    veiculoId,
    tipo,
    data: formData.get('data'),
    valor: Number(formData.get('valor')),
    descricao: formData.get('descricao'),
  };

  const observacoes = formData.get('observacoes');
  if (observacoes && String(observacoes).trim()) corpo.observacoes = observacoes;

  const odometro = formData.get('odometro');
  if (odometro) corpo.odometro = Number(odometro);

  if (tipo === 'abastecimento') {
    corpo.litros = Number(formData.get('litros'));
    corpo.precoLitro = Number(formData.get('precoLitro'));
    corpo.tipoCombustivel = formData.get('tipoCombustivel');
  }

  if (tipo === 'manutencao') {
    corpo.tipoManutencao = formData.get('tipoManutencao');
    const oficina = formData.get('oficina');
    if (oficina && String(oficina).trim()) corpo.oficina = oficina;
  }

  if (tipo === 'multa') {
    corpo.gravidade = formData.get('gravidade');
    const numeroAuto = formData.get('numeroAuto');
    if (numeroAuto && String(numeroAuto).trim()) corpo.numeroAuto = numeroAuto;
    const pontosCnh = formData.get('pontosCnh');
    if (pontosCnh) corpo.pontosCnh = Number(pontosCnh);
    const dataVencimento = formData.get('dataVencimento');
    if (dataVencimento && String(dataVencimento).trim()) corpo.dataVencimento = dataVencimento;
  }

  if (tipo === 'imposto') {
    corpo.tipoImposto = formData.get('tipoImposto');
    corpo.anoExercicio = Number(formData.get('anoExercicio'));
    const numeroParcela = formData.get('numeroParcela');
    if (numeroParcela) corpo.numeroParcela = Number(numeroParcela);
    const totalParcelas = formData.get('totalParcelas');
    if (totalParcelas) corpo.totalParcelas = Number(totalParcelas);
    const dataVencimento = formData.get('dataVencimento');
    if (dataVencimento && String(dataVencimento).trim()) corpo.dataVencimento = dataVencimento;
  }

  if (tipo === 'seguro') {
    corpo.seguradora = formData.get('seguradora');
    corpo.vigenciaInicio = formData.get('vigenciaInicio');
    corpo.vigenciaFim = formData.get('vigenciaFim');
    corpo.coberturaTipo = formData.get('coberturaTipo');
    const numeroApolice = formData.get('numeroApolice');
    if (numeroApolice && String(numeroApolice).trim()) corpo.numeroApolice = numeroApolice;
  }

  if (tipo === 'documentacao') {
    corpo.tipoDocumento = formData.get('tipoDocumento');
    const dataVencimento = formData.get('dataVencimento');
    if (dataVencimento && String(dataVencimento).trim()) corpo.dataVencimento = dataVencimento;
  }

  return corpo;
}

export async function acaoCriarDespesa(
  veiculoId: string,
  _estadoAnterior: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  const corpo = montarCorpo(veiculoId, formData);
  try {
    await fetchServidor('/despesas', { method: 'POST', body: JSON.stringify(corpo) });
  } catch (erro) {
    return {
      erro: erro instanceof ErroApi ? erro.message : 'Erro ao cadastrar despesa',
    };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
  redirect(`/veiculos/${veiculoId}/despesas`);
}

export async function acaoAtualizarDespesa(
  veiculoId: string,
  despesaId: string,
  _estadoAnterior: { erro?: string } | null,
  formData: FormData,
): Promise<{ erro?: string } | null> {
  const corpo = montarCorpo(veiculoId, formData);
  delete corpo.veiculoId; // não muda

  try {
    await fetchServidor(`/despesas/${despesaId}`, {
      method: 'PUT',
      body: JSON.stringify(corpo),
    });
  } catch (erro) {
    return {
      erro: erro instanceof ErroApi ? erro.message : 'Erro ao atualizar despesa',
    };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
  redirect(`/veiculos/${veiculoId}/despesas`);
}

export async function acaoExcluirDespesa(
  veiculoId: string,
  despesaId: string,
): Promise<{ erro?: string } | null> {
  try {
    await fetchServidor(`/despesas/${despesaId}`, { method: 'DELETE' });
  } catch (erro) {
    return {
      erro: erro instanceof ErroApi ? erro.message : 'Erro ao excluir despesa',
    };
  }
  revalidatePath(`/veiculos/${veiculoId}/despesas`);
  return null;
}
