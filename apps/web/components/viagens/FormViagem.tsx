'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TextField, TextArea, Button, Alert, Card, HStack, VStack, Heading, Text } from '@lojascem/components-react';
import type { UsuarioResposta, VeiculoResposta } from '@fleetops/types';

type AcaoFormulario = (
  estadoAnterior: { erro?: string } | null,
  formData: FormData,
) => Promise<{ erro?: string } | null>;

interface FormViagemProps {
  acao: AcaoFormulario;
  motoristas: UsuarioResposta[];
  veiculos: VeiculoResposta[];
}

interface ErrosCampos {
  destino?: string;
  dataViagem?: string;
  motoristaId?: string;
  veiculoId?: string;
  solicitadoPor?: string;
  autorizadoPor?: string;
}

function naoVazio(valor: string, rotulo: string): string {
  return valor.trim() ? '' : `Informe ${rotulo.toLowerCase()}`;
}

const labelSelect = 'block text-xs font-semibold uppercase tracking-wide mb-1';
const estiloSelect: React.CSSProperties = {
  borderColor: '#d1d5db',
  height: '38px',
  color: '#111827',
};

function hojeEmBrasilia(): string {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
  )
    .toISOString()
    .split('T')[0];
}

export function FormViagem({ acao, motoristas, veiculos }: FormViagemProps) {
  const hoje = hojeEmBrasilia();
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, setPendente] = useState(false);
  const [erros, setErros] = useState<ErrosCampos>({});
  const [tocados, setTocados] = useState<Record<string, boolean>>({});

  const [destino, setDestino] = useState('');
  const [dataViagem, setDataViagem] = useState('');
  const [horaInicioPrevista, setHoraInicioPrevista] = useState('');
  const [horaFimPrevista, setHoraFimPrevista] = useState('');
  const [motoristaId, setMotoristaId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [solicitadoPor, setSolicitadoPor] = useState('');
  const [autorizadoPor, setAutorizadoPor] = useState('');
  const [observacoes, setObservacoes] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setPendente(true);
    const formData = new FormData();
    formData.set('destino', destino);
    formData.set('dataViagem', dataViagem);
    formData.set('horaInicioPrevista', horaInicioPrevista);
    formData.set('horaFimPrevista', horaFimPrevista);
    formData.set('motoristaId', motoristaId);
    formData.set('veiculoId', veiculoId);
    formData.set('solicitadoPor', solicitadoPor);
    formData.set('autorizadoPor', autorizadoPor);
    if (observacoes) formData.set('observacoes', observacoes);
    const resultado = await acao(null, formData);
    setPendente(false);
    if (resultado?.erro) setErro(resultado.erro);
  }

  function erroBlur(campo: keyof ErrosCampos, valor: string, rotulo: string) {
    setTocados((p) => ({ ...p, [campo]: true }));
    setErros((p) => ({ ...p, [campo]: naoVazio(valor, rotulo) }));
  }

  function erroSelect(campo: keyof ErrosCampos, valor: string, rotulo: string) {
    setTocados((p) => ({ ...p, [campo]: true }));
    setErros((p) => ({ ...p, [campo]: valor ? '' : `Selecione ${rotulo.toLowerCase()}` }));
  }

  function erroCampo(campo: keyof ErrosCampos) {
    return tocados[campo] ? (erros[campo] ?? '') : '';
  }

  return (
    <div className="mx-auto max-w-2xl">
      <HStack alignItems="center" justifyContent="between" className="mb-6">
        <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
          Nova viagem
        </Heading>
        <Link href="/viagens" className="text-sm text-[var(--fo-text-secondary)]" style={{ textDecoration: 'none' }}>
          ← Voltar
        </Link>
      </HStack>

      <Card>
        <Card.Content>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Destino */}
            <TextField
              id="destino"
              label="Destino"
              placeholder="Av. Paulista, 1000 — São Paulo, SP"
              value={destino}
              onChange={(v) => setDestino(v)}
              isRequired
              isInvalid={Boolean(erroCampo('destino'))}
              errorMessage={erroCampo('destino')}
              aria-required="true"
              onBlur={() => erroBlur('destino', destino, 'o destino')}
            />

            {/* Data + Horários */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label htmlFor="dataViagem" className={labelSelect} style={{ color: '#374151' }}>
                  Data da viagem <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="dataViagem"
                  type="date"
                  value={dataViagem}
                  min={hoje}
                  required
                  onChange={(e) => setDataViagem(e.target.value)}
                  onBlur={() => erroBlur('dataViagem', dataViagem, 'a data')}
                  className="w-full rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={estiloSelect}
                />
                {erroCampo('dataViagem') && (
                  <span className="mt-1 text-xs" style={{ color: '#dc2626' }}>{erroCampo('dataViagem')}</span>
                )}
              </div>
              <div className="flex flex-col">
                <label htmlFor="horaInicioPrevista" className={labelSelect} style={{ color: '#374151' }}>
                  Hora início <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="horaInicioPrevista"
                  type="time"
                  value={horaInicioPrevista}
                  required
                  onChange={(e) => setHoraInicioPrevista(e.target.value)}
                  className="w-full rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={estiloSelect}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="horaFimPrevista" className={labelSelect} style={{ color: '#374151' }}>
                  Hora fim <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="horaFimPrevista"
                  type="time"
                  value={horaFimPrevista}
                  required
                  onChange={(e) => setHoraFimPrevista(e.target.value)}
                  className="w-full rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={estiloSelect}
                />
              </div>
            </div>

            {/* Motorista + Veículo */}
            <div className="grid grid-cols-2 gap-4">
              <VStack gap={1}>
                <div className="flex flex-col">
                  <label htmlFor="motoristaId" className={labelSelect} style={{ color: '#374151' }}>
                    Motorista <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    id="motoristaId"
                    value={motoristaId}
                    onChange={(e) => {
                      setMotoristaId(e.target.value);
                      erroSelect('motoristaId', e.target.value, 'um motorista');
                    }}
                    onBlur={(e) => erroSelect('motoristaId', e.target.value, 'um motorista')}
                    required
                    className="w-full rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={estiloSelect}
                  >
                    <option value="">Selecione um motorista</option>
                    {motoristas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome} ({m.matricula})
                      </option>
                    ))}
                  </select>
                  {erroCampo('motoristaId') && (
                    <span className="mt-1 text-xs" style={{ color: '#dc2626' }}>{erroCampo('motoristaId')}</span>
                  )}
                </div>
                {motoristas.length === 0 && (
                  <Text size="xs" style={{ color: '#d97706' }}>
                    Nenhum motorista ativo cadastrado.
                  </Text>
                )}
              </VStack>

              <VStack gap={1}>
                <div className="flex flex-col">
                  <label htmlFor="veiculoId" className={labelSelect} style={{ color: '#374151' }}>
                    Veículo <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    id="veiculoId"
                    value={veiculoId}
                    onChange={(e) => {
                      setVeiculoId(e.target.value);
                      erroSelect('veiculoId', e.target.value, 'um veículo');
                    }}
                    onBlur={(e) => erroSelect('veiculoId', e.target.value, 'um veículo')}
                    required
                    className="w-full rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={estiloSelect}
                  >
                    <option value="">Selecione um veículo</option>
                    {veiculos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.placa} — {v.marca} {v.modelo}
                      </option>
                    ))}
                  </select>
                  {erroCampo('veiculoId') && (
                    <span className="mt-1 text-xs" style={{ color: '#dc2626' }}>{erroCampo('veiculoId')}</span>
                  )}
                </div>
                {veiculos.length === 0 && (
                  <Text size="xs" style={{ color: '#d97706' }}>
                    Nenhum veículo ativo disponível.
                  </Text>
                )}
              </VStack>
            </div>

            {/* Solicitado + Autorizado */}
            <div className="grid grid-cols-2 gap-4">
              <TextField
                id="solicitadoPor"
                label="Solicitado por"
                placeholder="Nome do solicitante"
                value={solicitadoPor}
                onChange={(v) => setSolicitadoPor(v)}
                isRequired
                isInvalid={Boolean(erroCampo('solicitadoPor'))}
                errorMessage={erroCampo('solicitadoPor')}
                aria-required="true"
                onBlur={() => erroBlur('solicitadoPor', solicitadoPor, 'o solicitante')}
              />
              <TextField
                id="autorizadoPor"
                label="Autorizado por"
                placeholder="Nome do autorizador"
                value={autorizadoPor}
                onChange={(v) => setAutorizadoPor(v)}
                isRequired
                isInvalid={Boolean(erroCampo('autorizadoPor'))}
                errorMessage={erroCampo('autorizadoPor')}
                aria-required="true"
                onBlur={() => erroBlur('autorizadoPor', autorizadoPor, 'o autorizador')}
              />
            </div>

            {/* Observações */}
            <TextArea
              id="observacoes"
              label="Observações"
              placeholder="Informações adicionais..."
              value={observacoes}
              onChange={(v) => setObservacoes(v)}
              className="min-h-[80px]"
            />

            {erro && (
              <Alert color="error">{erro}</Alert>
            )}

            <HStack justifyContent="end" className="gap-3 pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <Link href="/viagens" style={{ textDecoration: 'none' }}>
                <Button variant="outline" color="default" type="button">Cancelar</Button>
              </Link>
              <Button
                type="submit"
                color="primary"
                isLoading={pendente}
                leftIcon="PiCheckBold"
              >
                {pendente ? 'Criando...' : 'Criar viagem'}
              </Button>
            </HStack>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
