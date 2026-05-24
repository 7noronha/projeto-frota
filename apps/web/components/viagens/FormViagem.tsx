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
import { schemaCriarViagem } from '@fleetops/validation';
import { validar } from '@/lib/validar';
import type { UsuarioResposta, VeiculoResposta, ViagemDetalhada } from '@fleetops/types';
import { agoraBrasilia, formatarDataBrasilia } from '@fleetops/utils';

type AcaoFormulario = (
  estadoAnterior: { erro?: string } | null,
  formData: FormData,
) => Promise<{ erro?: string } | null>;

interface FormViagemProps {
  acao: AcaoFormulario;
  motoristas: UsuarioResposta[];
  veiculos: VeiculoResposta[];
  viagemInicial?: ViagemDetalhada;
  modoEdicao?: boolean;
}

interface ErrosCampos {
  destino?: string;
  data_viagem?: string;
  motorista_id?: string;
  veiculo_id?: string;
  solicitado_por?: string;
  autorizado_por?: string;
}

function naoVazio(valor: string, rotulo: string): string {
  return valor.trim() ? '' : `Informe ${rotulo.toLowerCase()}`;
}

function hojeEmBrasilia(): string {
  return formatarDataBrasilia(agoraBrasilia(), 'yyyy-MM-dd');
}

export function FormViagem({
  acao,
  motoristas,
  veiculos,
  viagemInicial,
  modoEdicao = false,
}: FormViagemProps) {
  const hoje = hojeEmBrasilia();
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, setPendente] = useState(false);
  const [erros, setErros] = useState<ErrosCampos>({});
  const [tocados, setTocados] = useState<Record<string, boolean>>({});

  const [destino, setDestino] = useState(viagemInicial?.destino ?? '');
  const [data_viagem, setDataViagem] = useState(viagemInicial?.data_viagem ?? '');
  const [hora_inicio_prevista, setHoraInicioPrevista] = useState(
    viagemInicial?.hora_inicio_prevista ?? '',
  );
  const [hora_fim_prevista, setHoraFimPrevista] = useState(viagemInicial?.hora_fim_prevista ?? '');
  const [motorista_id, setMotoristaId] = useState(viagemInicial?.motorista_id ?? '');
  const [veiculo_id, setVeiculoId] = useState(viagemInicial?.veiculo_id ?? '');
  const [solicitado_por, setSolicitadoPor] = useState(viagemInicial?.solicitado_por ?? '');
  const [autorizado_por, setAutorizadoPor] = useState(viagemInicial?.autorizado_por ?? '');
  const [observacoes, setObservacoes] = useState(viagemInicial?.observacoes ?? '');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);

    // Validação Zod do payload inteiro antes de enviar — bloqueia
    // ida ao servidor se algum campo for inválido
    const resultadoValidacao = validar(schemaCriarViagem, {
      destino,
      data_viagem,
      hora_inicio_prevista,
      hora_fim_prevista,
      motorista_id,
      veiculo_id,
      solicitado_por,
      autorizado_por,
      observacoes: observacoes || undefined,
    });

    if (!resultadoValidacao.sucesso) {
      const novosErros: ErrosCampos = {};
      const novosTocados: Record<string, boolean> = {};
      for (const [campo, msg] of Object.entries(resultadoValidacao.erros)) {
        if (campo in ({} as ErrosCampos) || ['destino', 'data_viagem', 'motorista_id', 'veiculo_id', 'solicitado_por', 'autorizado_por'].includes(campo)) {
          (novosErros as Record<string, string>)[campo] = msg;
          novosTocados[campo] = true;
        }
      }
      setErros(novosErros);
      setTocados(novosTocados);
      setErro(resultadoValidacao.erros._form ?? Object.values(resultadoValidacao.erros)[0] ?? null);
      return;
    }

    if (data_viagem && data_viagem < hoje) {
      setErros((p) => ({ ...p, data_viagem: 'A data da viagem não pode estar no passado' }));
      setTocados((p) => ({ ...p, data_viagem: true }));
      return;
    }

    setPendente(true);
    const formData = new FormData();
    formData.set('destino', destino);
    formData.set('data_viagem', data_viagem);
    formData.set('hora_inicio_prevista', hora_inicio_prevista);
    formData.set('hora_fim_prevista', hora_fim_prevista);
    formData.set('motorista_id', String(motorista_id));
    formData.set('veiculo_id', String(veiculo_id));
    formData.set('solicitado_por', solicitado_por);
    formData.set('autorizado_por', autorizado_por);
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
          {modoEdicao ? 'Editar viagem' : 'Nova viagem'}
        </Heading>
        <Link
          href={modoEdicao && viagemInicial ? `/viagens/${viagemInicial.id}` : '/viagens'}
          className="text-sm text-[var(--fo-text-secondary)]"
          style={{ textDecoration: 'none' }}
        >
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
                id="data_viagem"
                label="Data da viagem"
                type="date"
                value={data_viagem}
                onChange={setDataViagem}
                isRequired
                isInvalid={Boolean(erroCampo('data_viagem'))}
                errorMessage={erroCampo('data_viagem')}
                aria-required="true"
                onBlur={() => erroBlur('data_viagem', data_viagem, 'a data')}
              />
              <TextField
                id="hora_inicio_prevista"
                label="Hora início"
                type="time"
                value={hora_inicio_prevista}
                onChange={setHoraInicioPrevista}
                isRequired
                aria-required="true"
              />
              <TextField
                id="hora_fim_prevista"
                label="Hora fim"
                type="time"
                value={hora_fim_prevista}
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
                isBlock
                isRequired
                aria-required="true"
                value={motorista_id || null}
                onChange={(valor) => {
                  const escolha = typeof valor === 'string' ? valor : '';
                  setMotoristaId(escolha);
                  erroSelect('motorista_id', escolha, 'um motorista');
                }}
                isInvalid={Boolean(erroCampo('motorista_id'))}
                errorMessage={erroCampo('motorista_id')}
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
                isBlock
                isRequired
                aria-required="true"
                value={veiculo_id || null}
                onChange={(valor) => {
                  const escolha = typeof valor === 'string' ? valor : '';
                  setVeiculoId(escolha);
                  erroSelect('veiculo_id', escolha, 'um veículo');
                }}
                isInvalid={Boolean(erroCampo('veiculo_id'))}
                errorMessage={erroCampo('veiculo_id')}
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
                id="solicitado_por"
                label="Solicitado por"
                placeholder="Nome do solicitante"
                value={solicitado_por}
                onChange={(v) => setSolicitadoPor(v)}
                isRequired
                isInvalid={Boolean(erroCampo('solicitado_por'))}
                errorMessage={erroCampo('solicitado_por')}
                aria-required="true"
                onBlur={() => erroBlur('solicitado_por', solicitado_por, 'o solicitante')}
              />
              <TextField
                id="autorizado_por"
                label="Autorizado por"
                placeholder="Nome do autorizador"
                value={autorizado_por}
                onChange={(v) => setAutorizadoPor(v)}
                isRequired
                isInvalid={Boolean(erroCampo('autorizado_por'))}
                errorMessage={erroCampo('autorizado_por')}
                aria-required="true"
                onBlur={() => erroBlur('autorizado_por', autorizado_por, 'o autorizador')}
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
              <Link
                href={modoEdicao && viagemInicial ? `/viagens/${viagemInicial.id}` : '/viagens'}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="outline" color="default" type="button">Cancelar</Button>
              </Link>
              <Button
                type="submit"
                color="primary"
                isLoading={pendente}
                leftIcon="PiCheckBold"
              >
                {pendente
                  ? modoEdicao ? 'Salvando...' : 'Criando...'
                  : modoEdicao ? 'Salvar alterações' : 'Criar viagem'}
              </Button>
            </HStack>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
