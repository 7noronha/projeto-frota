'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { InputText } from 'primereact/inputtext';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Card } from 'primereact/card';
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

export function FormVeiculo({ acao, veiculoInicial, titulo }: FormVeiculoProps) {
  const [estado, acaoForm, pendente] = useActionState(acao, null);

  const ehEdicao = Boolean(veiculoInicial);

  const [situacao, setSituacao] = useState(veiculoInicial?.situacao ?? 'ativo');
  const [anoFabricacao, setAnoFabricacao] = useState<number>(veiculoInicial?.anoFabricacao ?? anoAtual);
  const [anoModelo, setAnoModelo] = useState<number>(veiculoInicial?.anoModelo ?? anoAtual);
  const [odometro, setOdometro] = useState<number>(veiculoInicial?.odometroAtual ?? 0);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--fo-navy)]">
          {titulo}
        </h1>
        <Link href="/veiculos" className="text-sm text-[var(--fo-text-secondary)]" style={{ textDecoration: 'none' }}>
          ← Voltar
        </Link>
      </div>

      <Card>
        <form action={acaoForm} className="flex flex-col gap-5">
          {/* Placa + Situação */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="placa" className="text-sm font-medium" style={{ color: '#374151' }}>
                Placa <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <InputText
                id="placa"
                name="placa"
                placeholder="ABC1D23"
                defaultValue={veiculoInicial?.placa}
                disabled={ehEdicao}
                required
                className="w-full uppercase"
                style={ehEdicao ? { background: '#f8fafc' } : {}}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: '#374151' }}>
                Situação <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input type="hidden" name="situacao" value={situacao} />
              <Dropdown
                value={situacao}
                onChange={(e: { value: string }) => setSituacao(e.value)}
                options={SITUACOES}
                className="w-full"
              />
            </div>
          </div>

          {/* Marca + Modelo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="marca" className="text-sm font-medium" style={{ color: '#374151' }}>
                Marca <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <InputText
                id="marca"
                name="marca"
                placeholder="Toyota"
                defaultValue={veiculoInicial?.marca}
                required
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="modelo" className="text-sm font-medium" style={{ color: '#374151' }}>
                Modelo <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <InputText
                id="modelo"
                name="modelo"
                placeholder="Corolla"
                defaultValue={veiculoInicial?.modelo}
                required
                className="w-full"
              />
            </div>
          </div>

          {/* Ano Fabricação + Ano Modelo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: '#374151' }}>
                Ano de fabricação <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input type="hidden" name="anoFabricacao" value={anoFabricacao} />
              <InputNumber
                value={anoFabricacao}
                onValueChange={(e: InputNumberValueChangeEvent) => setAnoFabricacao(e.value ?? anoAtual)}
                min={ANO_MINIMO}
                max={anoAtual + 1}
                useGrouping={false}
                className="w-full"
                inputClassName="w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: '#374151' }}>
                Ano do modelo <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input type="hidden" name="anoModelo" value={anoModelo} />
              <InputNumber
                value={anoModelo}
                onValueChange={(e: InputNumberValueChangeEvent) => setAnoModelo(e.value ?? anoAtual)}
                min={ANO_MINIMO}
                max={anoAtual + 2}
                useGrouping={false}
                className="w-full"
                inputClassName="w-full"
              />
            </div>
          </div>

          {/* Cor + RENAVAM */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="cor" className="text-sm font-medium" style={{ color: '#374151' }}>
                Cor <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <InputText
                id="cor"
                name="cor"
                placeholder="Branco"
                defaultValue={veiculoInicial?.cor}
                required
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="renavam" className="text-sm font-medium" style={{ color: '#374151' }}>
                RENAVAM <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <InputText
                id="renavam"
                name="renavam"
                placeholder="12345678901"
                maxLength={11}
                defaultValue={veiculoInicial?.renavam}
                disabled={ehEdicao}
                required
                className="w-full"
                style={ehEdicao ? { background: '#f8fafc' } : {}}
              />
            </div>
          </div>

          {/* Odômetro + Data Aquisição */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: '#374151' }}>
                Odômetro atual (km) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input type="hidden" name="odometroAtual" value={odometro} />
              <InputNumber
                value={odometro}
                onValueChange={(e: InputNumberValueChangeEvent) => setOdometro(e.value ?? 0)}
                min={0}
                suffix=" km"
                locale="pt-BR"
                className="w-full"
                inputClassName="w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="dataAquisicao" className="text-sm font-medium" style={{ color: '#374151' }}>
                Data de aquisição <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <InputText
                id="dataAquisicao"
                name="dataAquisicao"
                type="date"
                defaultValue={veiculoInicial?.dataAquisicao}
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
              placeholder="Informações adicionais sobre o veículo..."
              defaultValue={veiculoInicial?.observacoes ?? ''}
              rows={3}
              className="w-full"
              autoResize={false}
            />
          </div>

          {estado?.erro && (
            <Message severity="error" text={estado.erro} className="w-full justify-start" />
          )}

          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
            <Link href="/veiculos" style={{ textDecoration: 'none' }}>
              <Button label="Cancelar" severity="secondary" outlined type="button" />
            </Link>
            <Button
              type="submit"
              label={pendente ? 'Salvando...' : ehEdicao ? 'Salvar alterações' : 'Cadastrar veículo'}
              loading={pendente}
              icon="pi pi-check"
            />
          </div>
        </form>
      </Card>
    </div>
  );
}
