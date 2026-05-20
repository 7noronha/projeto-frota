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
import { MapaSeletor } from '@/components/mapas/MapaSeletor';

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
  const [dataViagem, setDataViagem] = useState(viagemInicial?.dataViagem ?? '');
  const [horaInicioPrevista, setHoraInicioPrevista] = useState(
    viagemInicial?.horaInicioPrevista ?? '',
  );
  const [horaFimPrevista, setHoraFimPrevista] = useState(viagemInicial?.horaFimPrevista ?? '');
  const [motoristaId, setMotoristaId] = useState(viagemInicial?.motoristaId ?? '');
  const [veiculoId, setVeiculoId] = useState(viagemInicial?.veiculoId ?? '');
  const [solicitadoPor, setSolicitadoPor] = useState(viagemInicial?.solicitadoPor ?? '');
  const [autorizadoPor, setAutorizadoPor] = useState(viagemInicial?.autorizadoPor ?? '');
  const [observacoes, setObservacoes] = useState(viagemInicial?.observacoes ?? '');
  // GPS Fase 1 — coordenadas opcionais
  const [origemMapa, setOrigemMapa] = useState<{ latitude: number; longitude: number } | null>(
    viagemInicial?.origemLatitude != null && viagemInicial?.origemLongitude != null
      ? { latitude: viagemInicial.origemLatitude, longitude: viagemInicial.origemLongitude }
      : null,
  );
  const [destinoMapa, setDestinoMapa] = useState<{ latitude: number; longitude: number } | null>(
    viagemInicial?.destinoLatitude != null && viagemInicial?.destinoLongitude != null
      ? { latitude: viagemInicial.destinoLatitude, longitude: viagemInicial.destinoLongitude }
      : null,
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);

    // Validação Zod do payload inteiro antes de enviar — bloqueia
    // ida ao servidor se algum campo for inválido
    const resultadoValidacao = validar(schemaCriarViagem, {
      destino,
      dataViagem,
      horaInicioPrevista,
      horaFimPrevista,
      motoristaId,
      veiculoId,
      solicitadoPor,
      autorizadoPor,
      observacoes: observacoes || undefined,
    });

    if (!resultadoValidacao.sucesso) {
      const novosErros: ErrosCampos = {};
      const novosTocados: Record<string, boolean> = {};
      for (const [campo, msg] of Object.entries(resultadoValidacao.erros)) {
        if (campo in ({} as ErrosCampos) || ['destino', 'dataViagem', 'motoristaId', 'veiculoId', 'solicitadoPor', 'autorizadoPor'].includes(campo)) {
          (novosErros as Record<string, string>)[campo] = msg;
          novosTocados[campo] = true;
        }
      }
      setErros(novosErros);
      setTocados(novosTocados);
      setErro(resultadoValidacao.erros._form ?? Object.values(resultadoValidacao.erros)[0] ?? null);
      return;
    }

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
    if (origemMapa) {
      formData.set('origemLatitude', String(origemMapa.latitude));
      formData.set('origemLongitude', String(origemMapa.longitude));
    }
    if (destinoMapa) {
      formData.set('destinoLatitude', String(destinoMapa.latitude));
      formData.set('destinoLongitude', String(destinoMapa.longitude));
    }
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
                isBlock
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
                isBlock
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

            {/* Mapa — origem e destino (opcionais, Fase 1 do GPS) */}
            <VStack gap={2}>
              <Text size="sm" weight="medium" style={{ color: 'var(--fo-navy)' }}>
                Origem e destino no mapa (opcional)
              </Text>
              <MapaSeletor
                origem={origemMapa}
                destino={destinoMapa}
                onChange={({ origem, destino }) => {
                  setOrigemMapa(origem);
                  setDestinoMapa(destino);
                }}
              />
            </VStack>

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
