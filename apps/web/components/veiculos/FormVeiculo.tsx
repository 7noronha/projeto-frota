'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TextField, TextArea, NumberField, Button, Alert, Card, HStack, Heading } from '@lojascem/components-react';
import type { VeiculoResposta } from '@fleetops/types';

const ANO_MINIMO = 1950;
const anoAtual = new Date().getFullYear();

const SITUACOES = [
  { label: 'Ativo', value: 'ativo' },
  { label: 'Em manutenção', value: 'em_manutencao' },
  { label: 'Inativo', value: 'inativo' },
  { label: 'Baixado', value: 'baixado' },
];

type AcaoFormulario = (
  estadoAnterior: { erro?: string } | null,
  formData: FormData,
) => Promise<{ erro?: string } | null>;

interface FormVeiculoProps {
  acao: AcaoFormulario;
  veiculoInicial?: VeiculoResposta;
  titulo: string;
}

interface ErrosCampos {
  placa?: string;
  marca?: string;
  modelo?: string;
  cor?: string;
  renavam?: string;
}

function naoVazio(valor: string, rotulo: string): string {
  return valor.trim() ? '' : `Informe ${rotulo.toLowerCase()}`;
}

export function FormVeiculo({ acao, veiculoInicial, titulo }: FormVeiculoProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, setPendente] = useState(false);
  const [erros, setErros] = useState<ErrosCampos>({});
  const [tocados, setTocados] = useState<Record<string, boolean>>({});

  const ehEdicao = Boolean(veiculoInicial);

  const [placa, setPlaca] = useState(veiculoInicial?.placa ?? '');
  const [marca, setMarca] = useState(veiculoInicial?.marca ?? '');
  const [modelo, setModelo] = useState(veiculoInicial?.modelo ?? '');
  const [cor, setCor] = useState(veiculoInicial?.cor ?? '');
  const [renavam, setRenavam] = useState(veiculoInicial?.renavam ?? '');
  const [dataAquisicao, setDataAquisicao] = useState(veiculoInicial?.dataAquisicao ?? '');
  const [observacoes, setObservacoes] = useState(veiculoInicial?.observacoes ?? '');

  const [situacao, setSituacao] = useState<'ativo' | 'em_manutencao' | 'inativo' | 'baixado'>(
    (veiculoInicial?.situacao as 'ativo' | 'em_manutencao' | 'inativo' | 'baixado') ?? 'ativo',
  );
  const [anoFabricacao, setAnoFabricacao] = useState<number>(veiculoInicial?.anoFabricacao ?? anoAtual);
  const [anoModelo, setAnoModelo] = useState<number>(veiculoInicial?.anoModelo ?? anoAtual);
  const [odometro, setOdometro] = useState<number>(veiculoInicial?.odometroAtual ?? 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setPendente(true);
    const formData = new FormData();
    formData.set('placa', placa);
    formData.set('marca', marca);
    formData.set('modelo', modelo);
    formData.set('anoFabricacao', String(anoFabricacao));
    formData.set('anoModelo', String(anoModelo));
    formData.set('cor', cor);
    formData.set('renavam', renavam);
    formData.set('odometroAtual', String(odometro));
    formData.set('dataAquisicao', dataAquisicao);
    formData.set('situacao', situacao);
    if (observacoes) formData.set('observacoes', observacoes);
    const resultado = await acao(null, formData);
    setPendente(false);
    if (resultado?.erro) setErro(resultado.erro);
  }

  function erroBlur(campo: keyof ErrosCampos, valor: string, rotulo: string) {
    setTocados((p) => ({ ...p, [campo]: true }));
    setErros((p) => ({ ...p, [campo]: naoVazio(valor, rotulo) }));
  }

  function erroCampo(campo: keyof ErrosCampos) {
    return tocados[campo] ? erros[campo] : '';
  }

  return (
    <div className="mx-auto max-w-2xl">
      <HStack alignItems="center" justifyContent="between" className="mb-6">
        <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
          {titulo}
        </Heading>
        <Link href="/veiculos" className="text-sm text-[var(--fo-text-secondary)]" style={{ textDecoration: 'none' }}>
          ← Voltar
        </Link>
      </HStack>

      <Card>
        <Card.Content>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Placa + Situação */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <TextField
                  id="placa"
                  label="Placa"
                  placeholder="ABC1D23"
                  value={placa}
                  onChange={(v) => setPlaca(v.toUpperCase())}
                  isDisabled={ehEdicao}
                  isRequired
                  isInvalid={Boolean(erroCampo('placa'))}
                  errorMessage={erroCampo('placa')}
                  aria-required="true"
                  className="uppercase"
                  onBlur={() => !ehEdicao && erroBlur('placa', placa, 'a placa')}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="situacao"
                  className="block text-xs font-semibold uppercase tracking-wide"
                  style={{ color: '#374151' }}
                >
                  Situação <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  id="situacao"
                  name="situacao"
                  value={situacao}
                  onChange={(e) => setSituacao(e.target.value as typeof situacao)}
                  required
                  className="w-full rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: '#d1d5db', height: '38px', color: '#111827' }}
                >
                  {SITUACOES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Marca + Modelo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <TextField
                  id="marca"
                  label="Marca"
                  placeholder="Toyota"
                  value={marca}
                  onChange={(v) => setMarca(v)}
                  isRequired
                  isInvalid={Boolean(erroCampo('marca'))}
                  errorMessage={erroCampo('marca')}
                  aria-required="true"
                  onBlur={() => erroBlur('marca', marca, 'a marca')}
                />
              </div>
              <div>
                <TextField
                  id="modelo"
                  label="Modelo"
                  placeholder="Corolla"
                  value={modelo}
                  onChange={(v) => setModelo(v)}
                  isRequired
                  isInvalid={Boolean(erroCampo('modelo'))}
                  errorMessage={erroCampo('modelo')}
                  aria-required="true"
                  onBlur={() => erroBlur('modelo', modelo, 'o modelo')}
                />
              </div>
            </div>

            {/* Ano Fabricação + Ano Modelo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <NumberField
                  id="anoFabricacao"
                  label="Ano de fabricação"
                  isRequired
                  value={anoFabricacao}
                  onChange={(v) => setAnoFabricacao(v ?? anoAtual)}
                  minValue={ANO_MINIMO}
                  maxValue={anoAtual + 1}
                />
              </div>
              <div>
                <NumberField
                  id="anoModelo"
                  label="Ano do modelo"
                  isRequired
                  value={anoModelo}
                  onChange={(v) => setAnoModelo(v ?? anoAtual)}
                  minValue={ANO_MINIMO}
                  maxValue={anoAtual + 2}
                />
              </div>
            </div>

            {/* Cor + RENAVAM */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <TextField
                  id="cor"
                  label="Cor"
                  placeholder="Branco"
                  value={cor}
                  onChange={(v) => setCor(v)}
                  isRequired
                  isInvalid={Boolean(erroCampo('cor'))}
                  errorMessage={erroCampo('cor')}
                  aria-required="true"
                  onBlur={() => erroBlur('cor', cor, 'a cor')}
                />
              </div>
              <div>
                <TextField
                  id="renavam"
                  label="RENAVAM"
                  placeholder="12345678901"
                  maxLength={11}
                  value={renavam}
                  onChange={(v) => setRenavam(v)}
                  isDisabled={ehEdicao}
                  isRequired
                  isInvalid={Boolean(erroCampo('renavam'))}
                  errorMessage={erroCampo('renavam')}
                  aria-required="true"
                  onBlur={() => !ehEdicao && erroBlur('renavam', renavam, 'o RENAVAM')}
                />
              </div>
            </div>

            {/* Odômetro + Data Aquisição */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <NumberField
                  id="odometroAtual"
                  label="Odômetro atual (km)"
                  isRequired
                  value={odometro}
                  onChange={(v) => setOdometro(v ?? 0)}
                  minValue={0}
                />
              </div>
              <div>
                <TextField
                  id="dataAquisicao"
                  label="Data de aquisição"
                  type="date"
                  value={dataAquisicao}
                  onChange={(v) => setDataAquisicao(v)}
                  isRequired
                  aria-required="true"
                />
              </div>
            </div>

            {/* Observações */}
            <TextArea
              id="observacoes"
              label="Observações"
              placeholder="Informações adicionais sobre o veículo..."
              value={observacoes}
              onChange={(v) => setObservacoes(v)}
              className="min-h-[80px]"
            />

            {erro && (
              <Alert color="error">{erro}</Alert>
            )}

            <HStack justifyContent="end" className="gap-3 pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <Link href="/veiculos" style={{ textDecoration: 'none' }}>
                <Button variant="outline" color="default" type="button">Cancelar</Button>
              </Link>
              <Button
                type="submit"
                color="primary"
                isLoading={pendente}
                leftIcon="PiCheckBold"
              >
                {pendente ? 'Salvando...' : ehEdicao ? 'Salvar alterações' : 'Cadastrar veículo'}
              </Button>
            </HStack>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
