'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TextField,
  TextArea,
  Button,
  Alert,
  Card,
  HStack,
  VStack,
  Heading,
  Text,
  SelectField,
  ListBox,
} from '@lojascem/components-react';
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

    if (dataViagem && dataViagem < hoje) {
      setErros((p) => ({ ...p, dataViagem: 'A data da viagem não pode estar no passado' }));
      setTocados((p) => ({ ...p, dataViagem: true }));
      return;
    }

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
              <TextField
                id="dataViagem"
                label="Data da viagem"
                type="date"
                value={dataViagem}
                onChange={setDataViagem}
                isRequired
                isInvalid={Boolean(erroCampo('dataViagem'))}
                errorMessage={erroCampo('dataViagem')}
                aria-required="true"
                onBlur={() => erroBlur('dataViagem', dataViagem, 'a data')}
              />
              <TextField
                id="horaInicioPrevista"
                label="Hora início"
                type="time"
                value={horaInicioPrevista}
                onChange={setHoraInicioPrevista}
                isRequired
                aria-required="true"
              />
              <TextField
                id="horaFimPrevista"
                label="Hora fim"
                type="time"
                value={horaFimPrevista}
                onChange={setHoraFimPrevista}
                isRequired
                aria-required="true"
              />
            </div>

            {/* Motorista (acima) */}
            <VStack gap={1}>
              <SelectField
                label="Motorista"
                placeholder="Selecione um motorista"
                isRequired
                aria-required="true"
                value={motoristaId || null}
                onChange={(valor) => {
                  const escolha = typeof valor === 'string' ? valor : '';
                  setMotoristaId(escolha);
                  erroSelect('motoristaId', escolha, 'um motorista');
                }}
                isInvalid={Boolean(erroCampo('motoristaId'))}
                errorMessage={erroCampo('motoristaId')}
              >
                {motoristas.map((m) => (
                  <ListBox.Item key={m.id}>
                    {m.nome} ({m.matricula})
                  </ListBox.Item>
                ))}
              </SelectField>
              {motoristas.length === 0 && (
                <Text size="xs" style={{ color: '#d97706' }}>
                  Nenhum motorista ativo cadastrado.
                </Text>
              )}
            </VStack>

            {/* Veículo (abaixo) */}
            <VStack gap={1}>
              <SelectField
                label="Veículo"
                placeholder="Selecione um veículo"
                isRequired
                aria-required="true"
                value={veiculoId || null}
                onChange={(valor) => {
                  const escolha = typeof valor === 'string' ? valor : '';
                  setVeiculoId(escolha);
                  erroSelect('veiculoId', escolha, 'um veículo');
                }}
                isInvalid={Boolean(erroCampo('veiculoId'))}
                errorMessage={erroCampo('veiculoId')}
              >
                {veiculos.map((v) => (
                  <ListBox.Item key={v.id}>
                    {v.placa} — {v.marca} {v.modelo}
                  </ListBox.Item>
                ))}
              </SelectField>
              {veiculos.length === 0 && (
                <Text size="xs" style={{ color: '#d97706' }}>
                  Nenhum veículo ativo disponível.
                </Text>
              )}
            </VStack>

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
