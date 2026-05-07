'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { TextField, TextArea, SelectNative, NumberField, Button, Alert, Card } from '@minha-empresa/components-react';
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
        <Card.Body>
          <form action={acaoForm} className="flex flex-col gap-5">
            {/* Placa + Situação */}
            <div className="grid grid-cols-2 gap-4">
              <TextField
                id="placa"
                name="placa"
                label="Placa"
                placeholder="ABC1D23"
                defaultValue={veiculoInicial?.placa}
                isDisabled={ehEdicao}
                isRequired
                isInvalid={Boolean(erroCampo('placa'))}
                errorMessage={erroCampo('placa')}
                aria-required="true"
                className="uppercase"
                onBlur={(e) => !ehEdicao && erroBlur('placa', e.target.value, 'a placa')}
              />
              <div className="flex flex-col gap-1">
                <input type="hidden" name="situacao" value={situacao} />
                <SelectNative
                  id="situacao"
                  label="Situação"
                  isRequired
                  value={situacao}
                  onChange={(e) => setSituacao(e.target.value as typeof situacao)}
                >
                  {SITUACOES.map((s) => (
                    <SelectNative.Option key={s.value} value={s.value}>
                      {s.label}
                    </SelectNative.Option>
                  ))}
                </SelectNative>
              </div>
            </div>

            {/* Marca + Modelo */}
            <div className="grid grid-cols-2 gap-4">
              <TextField
                id="marca"
                name="marca"
                label="Marca"
                placeholder="Toyota"
                defaultValue={veiculoInicial?.marca}
                isRequired
                isInvalid={Boolean(erroCampo('marca'))}
                errorMessage={erroCampo('marca')}
                aria-required="true"
                onBlur={(e) => erroBlur('marca', e.target.value, 'a marca')}
              />
              <TextField
                id="modelo"
                name="modelo"
                label="Modelo"
                placeholder="Corolla"
                defaultValue={veiculoInicial?.modelo}
                isRequired
                isInvalid={Boolean(erroCampo('modelo'))}
                errorMessage={erroCampo('modelo')}
                aria-required="true"
                onBlur={(e) => erroBlur('modelo', e.target.value, 'o modelo')}
              />
            </div>

            {/* Ano Fabricação + Ano Modelo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input type="hidden" name="anoFabricacao" value={anoFabricacao} />
                <NumberField
                  id="anoFabricacao"
                  label="Ano de fabricação"
                  isRequired
                  value={anoFabricacao}
                  onChange={(v) => setAnoFabricacao(v ?? anoAtual)}
                  min={ANO_MINIMO}
                  max={anoAtual + 1}
                />
              </div>
              <div>
                <input type="hidden" name="anoModelo" value={anoModelo} />
                <NumberField
                  id="anoModelo"
                  label="Ano do modelo"
                  isRequired
                  value={anoModelo}
                  onChange={(v) => setAnoModelo(v ?? anoAtual)}
                  min={ANO_MINIMO}
                  max={anoAtual + 2}
                />
              </div>
            </div>

            {/* Cor + RENAVAM */}
            <div className="grid grid-cols-2 gap-4">
              <TextField
                id="cor"
                name="cor"
                label="Cor"
                placeholder="Branco"
                defaultValue={veiculoInicial?.cor}
                isRequired
                isInvalid={Boolean(erroCampo('cor'))}
                errorMessage={erroCampo('cor')}
                aria-required="true"
                onBlur={(e) => erroBlur('cor', e.target.value, 'a cor')}
              />
              <TextField
                id="renavam"
                name="renavam"
                label="RENAVAM"
                placeholder="12345678901"
                maxLength={11}
                defaultValue={veiculoInicial?.renavam}
                isDisabled={ehEdicao}
                isRequired
                isInvalid={Boolean(erroCampo('renavam'))}
                errorMessage={erroCampo('renavam')}
                aria-required="true"
                onBlur={(e) => !ehEdicao && erroBlur('renavam', e.target.value, 'o RENAVAM')}
              />
            </div>

            {/* Odômetro + Data Aquisição */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input type="hidden" name="odometroAtual" value={odometro} />
                <NumberField
                  id="odometroAtual"
                  label="Odômetro atual (km)"
                  isRequired
                  value={odometro}
                  onChange={(v) => setOdometro(v ?? 0)}
                  min={0}
                />
              </div>
              <TextField
                id="dataAquisicao"
                name="dataAquisicao"
                label="Data de aquisição"
                type="date"
                defaultValue={veiculoInicial?.dataAquisicao}
                isRequired
                aria-required="true"
              />
            </div>

            {/* Observações */}
            <TextArea
              id="observacoes"
              name="observacoes"
              label="Observações"
              placeholder="Informações adicionais sobre o veículo..."
              defaultValue={veiculoInicial?.observacoes ?? ''}
              rows={3}
            />

            {estado?.erro && (
              <Alert color="error">{estado.erro}</Alert>
            )}

            <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
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
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
}
