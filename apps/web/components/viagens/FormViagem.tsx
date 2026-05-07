'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { TextField, TextArea, SelectNative, Button, Alert, Card } from '@minha-empresa/components-react';
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

export function FormViagem({ acao, motoristas, veiculos }: FormViagemProps) {
  const [estado, acaoForm, pendente] = useActionState(acao, null);
  const [erros, setErros] = useState<ErrosCampos>({});
  const [tocados, setTocados] = useState<Record<string, boolean>>({});

  const hoje = new Date().toISOString().split('T')[0] ?? '';

  function tocar(campo: string) {
    setTocados((p) => ({ ...p, [campo]: true }));
  }

  function erroBlur(campo: keyof ErrosCampos, valor: string, rotulo: string) {
    tocar(campo);
    setErros((p) => ({ ...p, [campo]: naoVazio(valor, rotulo) }));
  }

  function erroSelect(campo: keyof ErrosCampos, valor: string, rotulo: string) {
    tocar(campo);
    setErros((p) => ({ ...p, [campo]: valor ? '' : `Selecione ${rotulo.toLowerCase()}` }));
  }

  function erroCampo(campo: keyof ErrosCampos) {
    return tocados[campo] ? erros[campo] : '';
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--fo-navy)]">
          Nova viagem
        </h1>
        <Link href="/viagens" className="text-sm text-[var(--fo-text-secondary)]" style={{ textDecoration: 'none' }}>
          ← Voltar
        </Link>
      </div>

      <Card>
        <Card.Body>
          <form action={acaoForm} className="flex flex-col gap-5">
            {/* Destino */}
            <TextField
              id="destino"
              name="destino"
              label="Destino"
              placeholder="Av. Paulista, 1000 — São Paulo, SP"
              isRequired
              isInvalid={Boolean(erroCampo('destino'))}
              errorMessage={erroCampo('destino')}
              aria-required="true"
              onBlur={(e) => erroBlur('destino', e.target.value, 'o destino')}
            />

            {/* Data + Horários */}
            <div className="grid grid-cols-3 gap-4">
              <TextField
                id="dataViagem"
                name="dataViagem"
                label="Data da viagem"
                type="date"
                min={hoje}
                isRequired
                isInvalid={Boolean(erroCampo('dataViagem'))}
                errorMessage={erroCampo('dataViagem')}
                aria-required="true"
                onBlur={(e) => erroBlur('dataViagem', e.target.value, 'a data')}
              />
              <TextField
                id="horaInicioPrevista"
                name="horaInicioPrevista"
                label="Hora início"
                type="time"
                isRequired
                aria-required="true"
              />
              <TextField
                id="horaFimPrevista"
                name="horaFimPrevista"
                label="Hora fim"
                type="time"
                isRequired
                aria-required="true"
              />
            </div>

            {/* Motorista + Veículo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <SelectNative
                  id="motoristaId"
                  name="motoristaId"
                  label="Motorista"
                  isRequired
                  isInvalid={Boolean(erroCampo('motoristaId'))}
                  errorMessage={erroCampo('motoristaId')}
                  placeholder="Selecione um motorista"
                  onChange={(e) => erroSelect('motoristaId', e.target.value, 'um motorista')}
                  onBlur={(e) => erroSelect('motoristaId', e.target.value, 'um motorista')}
                >
                  {motoristas.map((m) => (
                    <SelectNative.Option key={m.id} value={m.id}>
                      {m.nome} ({m.matricula})
                    </SelectNative.Option>
                  ))}
                </SelectNative>
                {motoristas.length === 0 && (
                  <p className="text-xs" style={{ color: '#d97706' }}>
                    Nenhum motorista ativo cadastrado.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <SelectNative
                  id="veiculoId"
                  name="veiculoId"
                  label="Veículo"
                  isRequired
                  isInvalid={Boolean(erroCampo('veiculoId'))}
                  errorMessage={erroCampo('veiculoId')}
                  placeholder="Selecione um veículo"
                  onChange={(e) => erroSelect('veiculoId', e.target.value, 'um veículo')}
                  onBlur={(e) => erroSelect('veiculoId', e.target.value, 'um veículo')}
                >
                  {veiculos.map((v) => (
                    <SelectNative.Option key={v.id} value={v.id}>
                      {v.placa} — {v.marca} {v.modelo}
                    </SelectNative.Option>
                  ))}
                </SelectNative>
                {veiculos.length === 0 && (
                  <p className="text-xs" style={{ color: '#d97706' }}>
                    Nenhum veículo ativo disponível.
                  </p>
                )}
              </div>
            </div>

            {/* Solicitado + Autorizado */}
            <div className="grid grid-cols-2 gap-4">
              <TextField
                id="solicitadoPor"
                name="solicitadoPor"
                label="Solicitado por"
                placeholder="Nome do solicitante"
                isRequired
                isInvalid={Boolean(erroCampo('solicitadoPor'))}
                errorMessage={erroCampo('solicitadoPor')}
                aria-required="true"
                onBlur={(e) => erroBlur('solicitadoPor', e.target.value, 'o solicitante')}
              />
              <TextField
                id="autorizadoPor"
                name="autorizadoPor"
                label="Autorizado por"
                placeholder="Nome do autorizador"
                isRequired
                isInvalid={Boolean(erroCampo('autorizadoPor'))}
                errorMessage={erroCampo('autorizadoPor')}
                aria-required="true"
                onBlur={(e) => erroBlur('autorizadoPor', e.target.value, 'o autorizador')}
              />
            </div>

            {/* Observações */}
            <TextArea
              id="observacoes"
              name="observacoes"
              label="Observações"
              placeholder="Informações adicionais..."
              rows={3}
            />

            {estado?.erro && (
              <Alert color="error">{estado.erro}</Alert>
            )}

            <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
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
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
}
