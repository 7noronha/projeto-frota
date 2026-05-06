'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Card } from 'primereact/card';
import { InputTextarea } from 'primereact/inputtextarea';
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
  const [motoristaId, setMotoristaId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');

  const hoje = new Date().toISOString().split('T')[0] ?? '';

  function tocar(campo: string) {
    setTocados((p) => ({ ...p, [campo]: true }));
  }

  function erroBlur(campo: keyof ErrosCampos, valor: string, rotulo: string) {
    tocar(campo);
    setErros((p) => ({ ...p, [campo]: naoVazio(valor, rotulo) }));
  }

  function erroDropdown(campo: keyof ErrosCampos, valor: string, rotulo: string) {
    tocar(campo);
    setErros((p) => ({ ...p, [campo]: valor ? '' : `Selecione ${rotulo.toLowerCase()}` }));
  }

  function erroCampo(campo: keyof ErrosCampos) {
    return tocados[campo] ? erros[campo] : '';
  }

  const opcoesMotoristas = motoristas.map((m) => ({
    label: `${m.nome} (${m.matricula})`,
    value: m.id,
  }));

  const opcoesVeiculos = veiculos.map((v) => ({
    label: `${v.placa} — ${v.marca} ${v.modelo}`,
    value: v.id,
  }));

  function CampoErro({ id, msg }: { id: string; msg?: string }) {
    if (!msg) return null;
    return (
      <p id={id} role="alert" className="text-xs" style={{ color: '#ef4444' }}>
        {msg}
      </p>
    );
  }

  function labelObrigatorio(texto: string) {
    return (
      <>
        {texto}{' '}
        <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
      </>
    );
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
        <form action={acaoForm} className="flex flex-col gap-5">
          {/* Destino */}
          <div className="flex flex-col gap-2">
            <label htmlFor="destino" className="text-sm font-medium" style={{ color: '#374151' }}>
              {labelObrigatorio('Destino')}
            </label>
            <InputText
              id="destino"
              name="destino"
              placeholder="Av. Paulista, 1000 — São Paulo, SP"
              required
              className="w-full"
              aria-required="true"
              aria-invalid={erroCampo('destino') ? 'true' : 'false'}
              aria-describedby={erroCampo('destino') ? 'destino-erro' : undefined}
              onBlur={(e) => erroBlur('destino', e.target.value, 'o destino')}
            />
            <CampoErro id="destino-erro" msg={erroCampo('destino')} />
          </div>

          {/* Data + Horários */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="dataViagem" className="text-sm font-medium" style={{ color: '#374151' }}>
                {labelObrigatorio('Data da viagem')}
              </label>
              <InputText
                id="dataViagem"
                name="dataViagem"
                type="date"
                min={hoje}
                required
                className="w-full"
                aria-required="true"
                aria-invalid={erroCampo('dataViagem') ? 'true' : 'false'}
                aria-describedby={erroCampo('dataViagem') ? 'dataViagem-erro' : undefined}
                onBlur={(e) => erroBlur('dataViagem', e.target.value, 'a data')}
              />
              <CampoErro id="dataViagem-erro" msg={erroCampo('dataViagem')} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="horaInicioPrevista" className="text-sm font-medium" style={{ color: '#374151' }}>
                {labelObrigatorio('Hora início')}
              </label>
              <InputText
                id="horaInicioPrevista"
                name="horaInicioPrevista"
                type="time"
                required
                className="w-full"
                aria-required="true"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="horaFimPrevista" className="text-sm font-medium" style={{ color: '#374151' }}>
                {labelObrigatorio('Hora fim')}
              </label>
              <InputText
                id="horaFimPrevista"
                name="horaFimPrevista"
                type="time"
                required
                className="w-full"
                aria-required="true"
              />
            </div>
          </div>

          {/* Motorista + Veículo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="motorista-dropdown" className="text-sm font-medium" style={{ color: '#374151' }}>
                {labelObrigatorio('Motorista')}
              </label>
              <input type="hidden" name="motoristaId" value={motoristaId} />
              <Dropdown
                inputId="motorista-dropdown"
                value={motoristaId}
                onChange={(e: { value: string }) => {
                  setMotoristaId(e.value);
                  erroDropdown('motoristaId', e.value, 'um motorista');
                }}
                options={opcoesMotoristas}
                placeholder="Selecione um motorista"
                className={`w-full${erroCampo('motoristaId') ? ' p-invalid' : ''}`}
                emptyMessage="Nenhum motorista disponível"
                aria-describedby={erroCampo('motoristaId') ? 'motorista-erro' : undefined}
              />
              <CampoErro id="motorista-erro" msg={erroCampo('motoristaId')} />
              {motoristas.length === 0 && (
                <p className="text-xs" style={{ color: '#d97706' }}>
                  Nenhum motorista ativo cadastrado.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="veiculo-dropdown" className="text-sm font-medium" style={{ color: '#374151' }}>
                {labelObrigatorio('Veículo')}
              </label>
              <input type="hidden" name="veiculoId" value={veiculoId} />
              <Dropdown
                inputId="veiculo-dropdown"
                value={veiculoId}
                onChange={(e: { value: string }) => {
                  setVeiculoId(e.value);
                  erroDropdown('veiculoId', e.value, 'um veículo');
                }}
                options={opcoesVeiculos}
                placeholder="Selecione um veículo"
                className={`w-full${erroCampo('veiculoId') ? ' p-invalid' : ''}`}
                emptyMessage="Nenhum veículo disponível"
                aria-describedby={erroCampo('veiculoId') ? 'veiculo-erro' : undefined}
              />
              <CampoErro id="veiculo-erro" msg={erroCampo('veiculoId')} />
              {veiculos.length === 0 && (
                <p className="text-xs" style={{ color: '#d97706' }}>
                  Nenhum veículo ativo disponível.
                </p>
              )}
            </div>
          </div>

          {/* Solicitado + Autorizado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="solicitadoPor" className="text-sm font-medium" style={{ color: '#374151' }}>
                {labelObrigatorio('Solicitado por')}
              </label>
              <InputText
                id="solicitadoPor"
                name="solicitadoPor"
                placeholder="Nome do solicitante"
                required
                className="w-full"
                aria-required="true"
                aria-invalid={erroCampo('solicitadoPor') ? 'true' : 'false'}
                aria-describedby={erroCampo('solicitadoPor') ? 'solicitadoPor-erro' : undefined}
                onBlur={(e) => erroBlur('solicitadoPor', e.target.value, 'o solicitante')}
              />
              <CampoErro id="solicitadoPor-erro" msg={erroCampo('solicitadoPor')} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="autorizadoPor" className="text-sm font-medium" style={{ color: '#374151' }}>
                {labelObrigatorio('Autorizado por')}
              </label>
              <InputText
                id="autorizadoPor"
                name="autorizadoPor"
                placeholder="Nome do autorizador"
                required
                className="w-full"
                aria-required="true"
                aria-invalid={erroCampo('autorizadoPor') ? 'true' : 'false'}
                aria-describedby={erroCampo('autorizadoPor') ? 'autorizadoPor-erro' : undefined}
                onBlur={(e) => erroBlur('autorizadoPor', e.target.value, 'o autorizador')}
              />
              <CampoErro id="autorizadoPor-erro" msg={erroCampo('autorizadoPor')} />
            </div>
          </div>

          {/* Observações */}
          <div className="flex flex-col gap-2">
            <label htmlFor="observacoes" className="text-sm font-medium" style={{ color: '#374151' }}>
              Observações
            </label>
            <InputTextarea
              id="observacoes"
              name="observacoes"
              placeholder="Informações adicionais..."
              rows={3}
              className="w-full"
              autoResize={false}
            />
          </div>

          {estado?.erro && (
            <Message severity="error" text={estado.erro} className="w-full justify-start" />
          )}

          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
            <Link href="/viagens" style={{ textDecoration: 'none' }}>
              <Button label="Cancelar" severity="secondary" outlined type="button" />
            </Link>
            <Button
              type="submit"
              label={pendente ? 'Criando...' : 'Criar viagem'}
              loading={pendente}
              icon="pi pi-check"
            />
          </div>
        </form>
      </Card>
    </div>
  );
}
