'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TextField,
  TextArea,
  NumberField,
  Button,
  Alert,
  Card,
  HStack,
  Heading,
  SelectField,
  ListBox,
} from '@lojascem/components-react';
import type { Despesa, TipoDespesa } from '@/app/(dashboard)/veiculos/[id]/despesas/actions';

type AcaoFormulario = (
  estadoAnterior: { erro?: string } | null,
  formData: FormData,
) => Promise<{ erro?: string } | null>;

interface FormDespesaProps {
  acao: AcaoFormulario;
  veiculoId: string;
  despesaInicial?: Despesa;
  titulo: string;
}

const TIPOS = [
  { valor: 'abastecimento', rotulo: 'Abastecimento' },
  { valor: 'manutencao', rotulo: 'Manutenção' },
  { valor: 'multa', rotulo: 'Multa' },
  { valor: 'imposto', rotulo: 'Imposto' },
  { valor: 'seguro', rotulo: 'Seguro' },
  { valor: 'documentacao', rotulo: 'Documentação' },
] as const;

const COMBUSTIVEIS = [
  { valor: 'gasolina', rotulo: 'Gasolina' },
  { valor: 'etanol', rotulo: 'Etanol' },
  { valor: 'diesel', rotulo: 'Diesel' },
  { valor: 'gnv', rotulo: 'GNV' },
  { valor: 'flex', rotulo: 'Flex' },
];

const TIPOS_MANUTENCAO = [
  { valor: 'preventiva', rotulo: 'Preventiva' },
  { valor: 'corretiva', rotulo: 'Corretiva' },
];

const GRAVIDADES = [
  { valor: 'leve', rotulo: 'Leve (3 pontos)' },
  { valor: 'media', rotulo: 'Média (4 pontos)' },
  { valor: 'grave', rotulo: 'Grave (5 pontos)' },
  { valor: 'gravissima', rotulo: 'Gravíssima (7 pontos)' },
];

const TIPOS_IMPOSTO = [
  { valor: 'ipva', rotulo: 'IPVA' },
  { valor: 'licenciamento', rotulo: 'Licenciamento' },
  { valor: 'dpvat', rotulo: 'DPVAT' },
  { valor: 'outro', rotulo: 'Outro' },
];

const COBERTURAS = [
  { valor: 'total', rotulo: 'Total (compreensiva + roubo/furto)' },
  { valor: 'terceiros', rotulo: 'Somente terceiros (RCF-V)' },
  { valor: 'compreensiva', rotulo: 'Compreensiva (colisão + incêndio)' },
];

const TIPOS_DOCUMENTO = [
  { valor: 'crlv', rotulo: 'CRLV' },
  { valor: 'transferencia', rotulo: 'Transferência' },
  { valor: 'vistoria', rotulo: 'Vistoria' },
  { valor: 'emplacamento', rotulo: 'Emplacamento' },
  { valor: 'outro', rotulo: 'Outro' },
];

const ANO_ATUAL = new Date().getFullYear();

function hojeBrasilia(): string {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
    .toISOString()
    .split('T')[0];
}

export function FormDespesa({ acao, veiculoId, despesaInicial, titulo }: FormDespesaProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, setPendente] = useState(false);

  const [tipo, setTipo] = useState<TipoDespesa>(despesaInicial?.tipo ?? 'abastecimento');
  const [data, setData] = useState(despesaInicial?.data ?? hojeBrasilia());
  const [valor, setValor] = useState<number | undefined>(despesaInicial?.valor);
  const [descricao, setDescricao] = useState(despesaInicial?.descricao ?? '');
  const [observacoes, setObservacoes] = useState(despesaInicial?.observacoes ?? '');
  const [odometro, setOdometro] = useState<number | undefined>(despesaInicial?.odometro ?? undefined);

  // Abastecimento
  const [litros, setLitros] = useState<number | undefined>(despesaInicial?.litros ?? undefined);
  const [precoLitro, setPrecoLitro] = useState<number | undefined>(despesaInicial?.precoLitro ?? undefined);
  const [tipoCombustivel, setTipoCombustivel] = useState<string>(
    despesaInicial?.tipoCombustivel ?? 'gasolina',
  );

  // Manutenção
  const [tipoManutencao, setTipoManutencao] = useState<string>(
    despesaInicial?.tipoManutencao ?? 'preventiva',
  );
  const [oficina, setOficina] = useState(despesaInicial?.oficina ?? '');

  // Multa
  const [numeroAuto, setNumeroAuto] = useState(despesaInicial?.numeroAuto ?? '');
  const [gravidade, setGravidade] = useState<string>(despesaInicial?.gravidade ?? 'leve');
  const [pontosCnh, setPontosCnh] = useState<number | undefined>(despesaInicial?.pontosCnh ?? undefined);
  const [dataVencimento, setDataVencimento] = useState(despesaInicial?.dataVencimento ?? '');

  // Imposto
  const [tipoImposto, setTipoImposto] = useState<string>(despesaInicial?.tipoImposto ?? 'ipva');
  const [anoExercicio, setAnoExercicio] = useState<number | undefined>(
    despesaInicial?.anoExercicio ?? ANO_ATUAL,
  );
  const [numeroParcela, setNumeroParcela] = useState<number | undefined>(
    despesaInicial?.numeroParcela ?? undefined,
  );
  const [totalParcelas, setTotalParcelas] = useState<number | undefined>(
    despesaInicial?.totalParcelas ?? undefined,
  );

  // Seguro
  const [seguradora, setSeguradora] = useState(despesaInicial?.seguradora ?? '');
  const [numeroApolice, setNumeroApolice] = useState(despesaInicial?.numeroApolice ?? '');
  const [vigenciaInicio, setVigenciaInicio] = useState(despesaInicial?.vigenciaInicio ?? '');
  const [vigenciaFim, setVigenciaFim] = useState(despesaInicial?.vigenciaFim ?? '');
  const [coberturaTipo, setCoberturaTipo] = useState<string>(
    despesaInicial?.coberturaTipo ?? 'total',
  );

  // Documentação
  const [tipoDocumento, setTipoDocumento] = useState<string>(
    despesaInicial?.tipoDocumento ?? 'crlv',
  );

  // Total estimado de abastecimento
  const totalAbastecimento =
    tipo === 'abastecimento' && litros && precoLitro ? litros * precoLitro : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);

    if (!valor || valor <= 0) {
      setErro('Informe um valor válido');
      return;
    }

    setPendente(true);
    const formData = new FormData();
    formData.set('tipo', tipo);
    formData.set('data', data);
    formData.set('valor', String(valor));
    formData.set('descricao', descricao);
    if (observacoes.trim()) formData.set('observacoes', observacoes);
    if (odometro != null) formData.set('odometro', String(odometro));

    if (tipo === 'abastecimento') {
      formData.set('litros', String(litros ?? 0));
      formData.set('precoLitro', String(precoLitro ?? 0));
      formData.set('tipoCombustivel', tipoCombustivel);
    } else if (tipo === 'manutencao') {
      formData.set('tipoManutencao', tipoManutencao);
      if (oficina.trim()) formData.set('oficina', oficina);
    } else if (tipo === 'multa') {
      formData.set('gravidade', gravidade);
      if (numeroAuto.trim()) formData.set('numeroAuto', numeroAuto);
      if (pontosCnh != null) formData.set('pontosCnh', String(pontosCnh));
      if (dataVencimento.trim()) formData.set('dataVencimento', dataVencimento);
    } else if (tipo === 'imposto') {
      formData.set('tipoImposto', tipoImposto);
      formData.set('anoExercicio', String(anoExercicio ?? ANO_ATUAL));
      if (numeroParcela != null) formData.set('numeroParcela', String(numeroParcela));
      if (totalParcelas != null) formData.set('totalParcelas', String(totalParcelas));
      if (dataVencimento.trim()) formData.set('dataVencimento', dataVencimento);
    } else if (tipo === 'seguro') {
      formData.set('seguradora', seguradora);
      formData.set('vigenciaInicio', vigenciaInicio);
      formData.set('vigenciaFim', vigenciaFim);
      formData.set('coberturaTipo', coberturaTipo);
      if (numeroApolice.trim()) formData.set('numeroApolice', numeroApolice);
    } else if (tipo === 'documentacao') {
      formData.set('tipoDocumento', tipoDocumento);
      if (dataVencimento.trim()) formData.set('dataVencimento', dataVencimento);
    }

    const resultado = await acao(null, formData);
    setPendente(false);
    if (resultado?.erro) setErro(resultado.erro);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <HStack alignItems="center" justifyContent="between" className="mb-6">
        <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
          {titulo}
        </Heading>
        <Link
          href={`/veiculos/${veiculoId}/despesas`}
          className="text-sm text-[var(--fo-text-secondary)]"
          style={{ textDecoration: 'none' }}
        >
          ← Voltar
        </Link>
      </HStack>

      <Card>
        <Card.Content>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Tipo de despesa"
                isBlock
                isRequired
                aria-required="true"
                value={tipo}
                onChange={(v) => {
                  if (typeof v === 'string') setTipo(v as TipoDespesa);
                }}
                isDisabled={!!despesaInicial}
              >
                {TIPOS.map((t) => (
                  <ListBox.Item key={t.valor}>{t.rotulo}</ListBox.Item>
                ))}
              </SelectField>

              <TextField
                id="data"
                label="Data"
                type="date"
                value={data}
                onChange={setData}
                isRequired
                aria-required="true"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <NumberField
                id="valor"
                label="Valor (R$)"
                value={valor}
                onChange={(v) => setValor(v ?? undefined)}
                minValue={0.01}
                step={0.01}
                formatOptions={{ style: 'currency', currency: 'BRL' }}
                isRequired
                aria-required="true"
              />

              <NumberField
                id="odometro"
                label="Odômetro (km)"
                value={odometro}
                onChange={(v) => setOdometro(v ?? undefined)}
                minValue={0}
                step={1}
              />
            </div>

            <TextField
              id="descricao"
              label="Descrição"
              placeholder="POSTO IPIRANGA — TANQUE COMPLETO"
              value={descricao}
              onChange={setDescricao}
              isBlock
              isRequired
              aria-required="true"
            />

            {/* ─── Campos específicos: ABASTECIMENTO ─────────────────────────── */}
            {tipo === 'abastecimento' && (
              <>
                <div
                  className="rounded-md px-4 py-2 text-sm font-medium"
                  style={{
                    background: '#EFF6FF',
                    color: '#1D4ED8',
                    borderLeft: '3px solid #3B82F6',
                  }}
                >
                  Dados do abastecimento
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <NumberField
                    id="litros"
                    label="Litros"
                    value={litros}
                    onChange={(v) => setLitros(v ?? undefined)}
                    minValue={0.001}
                    step={0.001}
                    formatOptions={{ maximumFractionDigits: 3 }}
                    isRequired
                  />
                  <NumberField
                    id="precoLitro"
                    label="Preço/litro (R$)"
                    value={precoLitro}
                    onChange={(v) => setPrecoLitro(v ?? undefined)}
                    minValue={0.001}
                    step={0.001}
                    formatOptions={{ style: 'currency', currency: 'BRL', maximumFractionDigits: 3 }}
                    isRequired
                  />
                  <SelectField
                    label="Combustível"
                    isBlock
                    isRequired
                    value={tipoCombustivel}
                    onChange={(v) => {
                      if (typeof v === 'string') setTipoCombustivel(v);
                    }}
                  >
                    {COMBUSTIVEIS.map((c) => (
                      <ListBox.Item key={c.valor}>{c.rotulo}</ListBox.Item>
                    ))}
                  </SelectField>
                </div>
                {totalAbastecimento != null && (
                  <div
                    className="rounded-md px-4 py-2 text-sm"
                    style={{ background: '#F0FDF4', color: '#15803D' }}
                  >
                    Total calculado:{' '}
                    <strong>
                      {totalAbastecimento.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </strong>
                    {valor && Math.abs(valor - totalAbastecimento) > 0.01 && (
                      <span className="ml-2" style={{ color: '#B45309' }}>
                        · Valor informado difere (
                        {(valor - totalAbastecimento).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                        )
                      </span>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ─── Campos específicos: MANUTENÇÃO ────────────────────────────── */}
            {tipo === 'manutencao' && (
              <>
                <div
                  className="rounded-md px-4 py-2 text-sm font-medium"
                  style={{
                    background: '#FEF3C7',
                    color: '#92400E',
                    borderLeft: '3px solid #F59E0B',
                  }}
                >
                  Dados da manutenção
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Tipo de manutenção"
                    isBlock
                    isRequired
                    value={tipoManutencao}
                    onChange={(v) => {
                      if (typeof v === 'string') setTipoManutencao(v);
                    }}
                  >
                    {TIPOS_MANUTENCAO.map((m) => (
                      <ListBox.Item key={m.valor}>{m.rotulo}</ListBox.Item>
                    ))}
                  </SelectField>
                  <TextField
                    id="oficina"
                    label="Oficina"
                    placeholder="OFICINA CENTRAL"
                    value={oficina}
                    onChange={setOficina}
                  />
                </div>
              </>
            )}

            {/* ─── Campos específicos: MULTA ─────────────────────────────────── */}
            {tipo === 'multa' && (
              <>
                <div
                  className="rounded-md px-4 py-2 text-sm font-medium"
                  style={{
                    background: '#FEE2E2',
                    color: '#991B1B',
                    borderLeft: '3px solid #DC2626',
                  }}
                >
                  Dados da multa
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    id="numeroAuto"
                    label="Número do auto"
                    placeholder="AB-1234567"
                    value={numeroAuto}
                    onChange={setNumeroAuto}
                  />
                  <SelectField
                    label="Gravidade"
                    isBlock
                    isRequired
                    value={gravidade}
                    onChange={(v) => {
                      if (typeof v === 'string') setGravidade(v);
                    }}
                  >
                    {GRAVIDADES.map((g) => (
                      <ListBox.Item key={g.valor}>{g.rotulo}</ListBox.Item>
                    ))}
                  </SelectField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <NumberField
                    id="pontosCnh"
                    label="Pontos na CNH"
                    value={pontosCnh}
                    onChange={(v) => setPontosCnh(v ?? undefined)}
                    minValue={0}
                    step={1}
                  />
                  <TextField
                    id="dataVencimento"
                    label="Vencimento do pagamento"
                    type="date"
                    value={dataVencimento}
                    onChange={setDataVencimento}
                  />
                </div>
              </>
            )}

            {/* ─── Campos específicos: IMPOSTO ────────────────────────────────── */}
            {tipo === 'imposto' && (
              <>
                <div
                  className="rounded-md px-4 py-2 text-sm font-medium"
                  style={{
                    background: '#F3E8FF',
                    color: '#6B21A8',
                    borderLeft: '3px solid #9333EA',
                  }}
                >
                  Dados do imposto
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Tipo de imposto"
                    isBlock
                    isRequired
                    value={tipoImposto}
                    onChange={(v) => {
                      if (typeof v === 'string') setTipoImposto(v);
                    }}
                  >
                    {TIPOS_IMPOSTO.map((t) => (
                      <ListBox.Item key={t.valor}>{t.rotulo}</ListBox.Item>
                    ))}
                  </SelectField>
                  <NumberField
                    id="anoExercicio"
                    label="Ano de exercício"
                    value={anoExercicio}
                    onChange={(v) => setAnoExercicio(v ?? undefined)}
                    minValue={2000}
                    maxValue={ANO_ATUAL + 1}
                    step={1}
                    formatOptions={{ useGrouping: false }}
                    isRequired
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <NumberField
                    id="numeroParcela"
                    label="Parcela atual"
                    value={numeroParcela}
                    onChange={(v) => setNumeroParcela(v ?? undefined)}
                    minValue={1}
                    step={1}
                  />
                  <NumberField
                    id="totalParcelas"
                    label="Total de parcelas"
                    value={totalParcelas}
                    onChange={(v) => setTotalParcelas(v ?? undefined)}
                    minValue={1}
                    step={1}
                  />
                  <TextField
                    id="dataVencimento"
                    label="Vencimento"
                    type="date"
                    value={dataVencimento}
                    onChange={setDataVencimento}
                  />
                </div>
              </>
            )}

            {/* ─── Campos específicos: SEGURO ─────────────────────────────────── */}
            {tipo === 'seguro' && (
              <>
                <div
                  className="rounded-md px-4 py-2 text-sm font-medium"
                  style={{
                    background: '#DBEAFE',
                    color: '#1E40AF',
                    borderLeft: '3px solid #2563EB',
                  }}
                >
                  Dados do seguro
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    id="seguradora"
                    label="Seguradora"
                    placeholder="PORTO SEGURO"
                    value={seguradora}
                    onChange={setSeguradora}
                    isRequired
                  />
                  <TextField
                    id="numeroApolice"
                    label="Nº da apólice"
                    placeholder="12345678-9"
                    value={numeroApolice}
                    onChange={setNumeroApolice}
                  />
                </div>
                <SelectField
                  label="Tipo de cobertura"
                  isBlock
                  isRequired
                  value={coberturaTipo}
                  onChange={(v) => {
                    if (typeof v === 'string') setCoberturaTipo(v);
                  }}
                >
                  {COBERTURAS.map((c) => (
                    <ListBox.Item key={c.valor}>{c.rotulo}</ListBox.Item>
                  ))}
                </SelectField>
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    id="vigenciaInicio"
                    label="Vigência — início"
                    type="date"
                    value={vigenciaInicio}
                    onChange={setVigenciaInicio}
                    isRequired
                  />
                  <TextField
                    id="vigenciaFim"
                    label="Vigência — fim"
                    type="date"
                    value={vigenciaFim}
                    onChange={setVigenciaFim}
                    isRequired
                  />
                </div>
              </>
            )}

            {/* ─── Campos específicos: DOCUMENTAÇÃO ───────────────────────────── */}
            {tipo === 'documentacao' && (
              <>
                <div
                  className="rounded-md px-4 py-2 text-sm font-medium"
                  style={{
                    background: '#ECFDF5',
                    color: '#065F46',
                    borderLeft: '3px solid #10B981',
                  }}
                >
                  Dados da documentação
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Tipo de documento"
                    isBlock
                    isRequired
                    value={tipoDocumento}
                    onChange={(v) => {
                      if (typeof v === 'string') setTipoDocumento(v);
                    }}
                  >
                    {TIPOS_DOCUMENTO.map((t) => (
                      <ListBox.Item key={t.valor}>{t.rotulo}</ListBox.Item>
                    ))}
                  </SelectField>
                  <TextField
                    id="dataVencimento"
                    label="Vencimento / Validade"
                    type="date"
                    value={dataVencimento}
                    onChange={setDataVencimento}
                  />
                </div>
              </>
            )}

            <TextArea
              id="observacoes"
              label="Observações"
              placeholder="Informações adicionais..."
              value={observacoes}
              onChange={setObservacoes}
              isBlock
              className="min-h-[80px]"
            />

            {erro && <Alert color="error">{erro}</Alert>}

            <HStack
              justifyContent="end"
              className="gap-3 pt-4"
              style={{ borderTop: '1px solid #f1f5f9' }}
            >
              <Link href={`/veiculos/${veiculoId}/despesas`} style={{ textDecoration: 'none' }}>
                <Button variant="outline" color="default" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                color="primary"
                isLoading={pendente}
                leftIcon="PiCheckBold"
              >
                {pendente
                  ? 'Salvando...'
                  : despesaInicial
                    ? 'Salvar alterações'
                    : 'Cadastrar despesa'}
              </Button>
            </HStack>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
