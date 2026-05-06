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
  const [estado, acaoForm, pendente] = useActionState(acao, null);
  const [erros, setErros] = useState<ErrosCampos>({});
  const [tocados, setTocados] = useState<Record<string, boolean>>({});

  const ehEdicao = Boolean(veiculoInicial);

  const [situacao, setSituacao] = useState<'ativo' | 'em_manutencao' | 'inativo' | 'baixado'>(
    (veiculoInicial?.situacao as 'ativo' | 'em_manutencao' | 'inativo' | 'baixado') ?? 'ativo',
  );
  const [anoFabricacao, setAnoFabricacao] = useState<number>(veiculoInicial?.anoFabricacao ?? anoAtual);
  const [anoModelo, setAnoModelo] = useState<number>(veiculoInicial?.anoModelo ?? anoAtual);
  const [odometro, setOdometro] = useState<number>(veiculoInicial?.odometroAtual ?? 0);

  function erroBlur(campo: keyof ErrosCampos, valor: string, rotulo: string) {
    setTocados((p) => ({ ...p, [campo]: true }));
    setErros((p) => ({ ...p, [campo]: naoVazio(valor, rotulo) }));
  }

  function erroCampo(campo: keyof ErrosCampos) {
    return tocados[campo] ? erros[campo] : '';
  }

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
        <span className="sr-only">(obrigatório)</span>
      </>
    );
  }

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
                {labelObrigatorio('Placa')}
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
                aria-required="true"
                aria-invalid={erroCampo('placa') ? 'true' : 'false'}
                aria-describedby={erroCampo('placa') ? 'placa-erro' : undefined}
                onBlur={(e) => !ehEdicao && erroBlur('placa', e.target.value, 'a placa')}
              />
              <CampoErro id="placa-erro" msg={erroCampo('placa')} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="situacao-dropdown" className="text-sm font-medium" style={{ color: '#374151' }}>
                {labelObrigatorio('Situação')}
              </label>
              <input type="hidden" name="situacao" value={situacao} />
              <Dropdown
                inputId="situacao-dropdown"
                value={situacao}
                onChange={(e: { value: 'ativo' | 'em_manutencao' | 'inativo' | 'baixado' }) =>
                  setSituacao(e.value)
                }
                options={SITUACOES}
                className="w-full"
              />
            </div>
          </div>

          {/* Marca + Modelo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="marca" className="text-sm font-medium" style={{ color: '#374151' }}>
                {labelObrigatorio('Marca')}
              </label>
              <InputText
                id="marca"
                name="marca"
                placeholder="Toyota"
                defaultValue={veiculoInicial?.marca}
                required
                className="w-full"
                aria-required="true"
                aria-invalid={erroCampo('marca') ? 'true' : 'false'}
                aria-describedby={erroCampo('marca') ? 'marca-erro' : undefined}
                onBlur={(e) => erroBlur('marca', e.target.value, 'a marca')}
              />
              <CampoErro id="marca-erro" msg={erroCampo('marca')} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="modelo" className="text-sm font-medium" style={{ color: '#374151' }}>
                {labelObrigatorio('Modelo')}
              </label>
              <InputText
                id="modelo"
                name="modelo"
                placeholder="Corolla"
                defaultValue={veiculoInicial?.modelo}
                required
                className="w-full"
                aria-required="true"
                aria-invalid={erroCampo('modelo') ? 'true' : 'false'}
                aria-describedby={erroCampo('modelo') ? 'modelo-erro' : undefined}
                onBlur={(e) => erroBlur('modelo', e.target.value, 'o modelo')}
              />
              <CampoErro id="modelo-erro" msg={erroCampo('modelo')} />
            </div>
          </div>

          {/* Ano Fabricação + Ano Modelo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="ano-fabricacao-input" className="text-sm font-medium" style={{ color: '#374151' }}>
                {labelObrigatorio('Ano de fabricação')}
              </label>
              <input type="hidden" name="anoFabricacao" value={anoFabricacao} />
              <InputNumber
                inputId="ano-fabricacao-input"
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
              <label htmlFor="ano-modelo-input" className="text-sm font-medium" style={{ color: '#374151' }}>
                {labelObrigatorio('Ano do modelo')}
              </label>
              <input type="hidden" name="anoModelo" value={anoModelo} />
              <InputNumber
                inputId="ano-modelo-input"
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
                {labelObrigatorio('Cor')}
              </label>
              <InputText
                id="cor"
                name="cor"
                placeholder="Branco"
                defaultValue={veiculoInicial?.cor}
                required
                className="w-full"
                aria-required="true"
                aria-invalid={erroCampo('cor') ? 'true' : 'false'}
                aria-describedby={erroCampo('cor') ? 'cor-erro' : undefined}
                onBlur={(e) => erroBlur('cor', e.target.value, 'a cor')}
              />
              <CampoErro id="cor-erro" msg={erroCampo('cor')} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="renavam" className="text-sm font-medium" style={{ color: '#374151' }}>
                {labelObrigatorio('RENAVAM')}
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
                aria-required="true"
                aria-invalid={erroCampo('renavam') ? 'true' : 'false'}
                aria-describedby={erroCampo('renavam') ? 'renavam-erro' : undefined}
                onBlur={(e) => !ehEdicao && erroBlur('renavam', e.target.value, 'o RENAVAM')}
              />
              <CampoErro id="renavam-erro" msg={erroCampo('renavam')} />
            </div>
          </div>

          {/* Odômetro + Data Aquisição */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="odometro-input" className="text-sm font-medium" style={{ color: '#374151' }}>
                {labelObrigatorio('Odômetro atual (km)')}
              </label>
              <input type="hidden" name="odometroAtual" value={odometro} />
              <InputNumber
                inputId="odometro-input"
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
                {labelObrigatorio('Data de aquisição')}
              </label>
              <InputText
                id="dataAquisicao"
                name="dataAquisicao"
                type="date"
                defaultValue={veiculoInicial?.dataAquisicao}
                required
                className="w-full"
                aria-required="true"
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
