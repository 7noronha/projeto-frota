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

export function FormViagem({ acao, motoristas, veiculos }: FormViagemProps) {
  const [estado, acaoForm, pendente] = useActionState(acao, null);

  const [motoristaId, setMotoristaId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');

  const hoje = new Date().toISOString().split('T')[0] ?? '';

  const opcoesMotoristas = motoristas.map((m) => ({
    label: `${m.nome} (${m.matricula})`,
    value: m.id,
  }));

  const opcoesVeiculos = veiculos.map((v) => ({
    label: `${v.placa} — ${v.marca} ${v.modelo}`,
    value: v.id,
  }));

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
              Destino <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <InputText
              id="destino"
              name="destino"
              placeholder="Av. Paulista, 1000 — São Paulo, SP"
              required
              className="w-full"
            />
          </div>

          {/* Data + Horários */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="dataViagem" className="text-sm font-medium" style={{ color: '#374151' }}>
                Data da viagem <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <InputText
                id="dataViagem"
                name="dataViagem"
                type="date"
                min={hoje}
                required
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="horaInicioPrevista" className="text-sm font-medium" style={{ color: '#374151' }}>
                Hora início <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <InputText
                id="horaInicioPrevista"
                name="horaInicioPrevista"
                type="time"
                required
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="horaFimPrevista" className="text-sm font-medium" style={{ color: '#374151' }}>
                Hora fim <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <InputText
                id="horaFimPrevista"
                name="horaFimPrevista"
                type="time"
                required
                className="w-full"
              />
            </div>
          </div>

          {/* Motorista + Veículo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: '#374151' }}>
                Motorista <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input type="hidden" name="motoristaId" value={motoristaId} />
              <Dropdown
                value={motoristaId}
                onChange={(e: { value: string }) => setMotoristaId(e.value)}
                options={opcoesMotoristas}
                placeholder="Selecione um motorista"
                className="w-full"
                emptyMessage="Nenhum motorista disponível"
              />
              {motoristas.length === 0 && (
                <p className="text-xs" style={{ color: '#d97706' }}>
                  Nenhum motorista ativo cadastrado.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: '#374151' }}>
                Veículo <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input type="hidden" name="veiculoId" value={veiculoId} />
              <Dropdown
                value={veiculoId}
                onChange={(e: { value: string }) => setVeiculoId(e.value)}
                options={opcoesVeiculos}
                placeholder="Selecione um veículo"
                className="w-full"
                emptyMessage="Nenhum veículo disponível"
              />
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
                Solicitado por <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <InputText
                id="solicitadoPor"
                name="solicitadoPor"
                placeholder="Nome do solicitante"
                required
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="autorizadoPor" className="text-sm font-medium" style={{ color: '#374151' }}>
                Autorizado por <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <InputText
                id="autorizadoPor"
                name="autorizadoPor"
                placeholder="Nome do autorizador"
                required
                className="w-full"
              />
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
