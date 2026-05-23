'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TextField,
  Button,
  Alert,
  Card,
  HStack,
  Heading,
  SelectField,
  ListBox,
} from '@lojascem/components-react';
import type { SeguroResposta, ItemLookup } from '@fleetops/types';

type AcaoFormulario = (
  estadoAnterior: { erro?: string } | null,
  formData: FormData,
) => Promise<{ erro?: string } | null>;

interface FormSeguroProps {
  veiculoId: number;
  tiposCobertura: ItemLookup[];
  seguroInicial?: SeguroResposta;
  acao: AcaoFormulario;
  titulo: string;
}

export function FormSeguro({
  veiculoId,
  tiposCobertura,
  seguroInicial,
  acao,
  titulo,
}: FormSeguroProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, setPendente] = useState(false);

  const [tipoId, setTipoId] = useState<string>(
    seguroInicial?.tipo_cobertura_seguro_id ? String(seguroInicial.tipo_cobertura_seguro_id) : '',
  );
  const [data, setData] = useState(seguroInicial?.data ?? '');
  const [valor, setValor] = useState(seguroInicial ? String(seguroInicial.valor) : '');
  const [descricao, setDescricao] = useState(seguroInicial?.descricao ?? '');
  const [seguradora, setSeguradora] = useState(seguroInicial?.seguradora ?? '');
  const [apolice, setApolice] = useState(seguroInicial?.numero_apolice ?? '');
  const [vigInicio, setVigInicio] = useState(seguroInicial?.vigencia_inicio ?? '');
  const [vigFim, setVigFim] = useState(seguroInicial?.vigencia_fim ?? '');
  const [observacoes, setObservacoes] = useState(seguroInicial?.observacoes ?? '');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    if (!tipoId) return setErro('Selecione a cobertura');
    if (vigInicio && vigFim && new Date(vigFim) < new Date(vigInicio)) {
      return setErro('Vigência final não pode ser anterior à inicial');
    }
    setPendente(true);
    const fd = new FormData();
    fd.set('tipo_cobertura_seguro_id', tipoId);
    fd.set('data', data);
    fd.set('valor', valor);
    fd.set('descricao', descricao);
    fd.set('seguradora', seguradora);
    fd.set('vigencia_inicio', vigInicio);
    fd.set('vigencia_fim', vigFim);
    if (apolice.trim()) fd.set('numero_apolice', apolice);
    if (observacoes.trim()) fd.set('observacoes', observacoes);
    const r = await acao(null, fd);
    setPendente(false);
    if (r?.erro) setErro(r.erro);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <HStack alignItems="center" justifyContent="between" className="mb-6">
        <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
          {titulo}
        </Heading>
        <Link
          href={`/veiculos/${veiculoId}/despesas`}
          className="text-sm"
          style={{ textDecoration: 'none', color: 'var(--fo-text-secondary)' }}
        >
          ← Voltar
        </Link>
      </HStack>

      <Card>
        <Card.Content>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {erro && <Alert color="error">{erro}</Alert>}

            <SelectField label="Cobertura" value={tipoId} onChange={setTipoId}>
              {tiposCobertura.map((t) => (
                <ListBox.Item key={String(t.id)}>{t.nome}</ListBox.Item>
              ))}
            </SelectField>

            <div className="grid grid-cols-2 gap-4">
              <TextField id="data" label="Data" type="date" value={data} onChange={setData} isRequired />
              <TextField
                id="valor"
                label="Valor (R$)"
                type="number"
                value={valor}
                onChange={setValor}
                isRequired
              />
            </div>

            <TextField
              id="descricao"
              label="Descrição"
              value={descricao}
              onChange={setDescricao}
              maxLength={500}
              isRequired
            />

            <div className="grid grid-cols-2 gap-4">
              <TextField
                id="seguradora"
                label="Seguradora"
                value={seguradora}
                onChange={setSeguradora}
                maxLength={200}
                isRequired
              />
              <TextField
                id="numero_apolice"
                label="Número da apólice"
                value={apolice}
                onChange={setApolice}
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TextField
                id="vigencia_inicio"
                label="Vigência início"
                type="date"
                value={vigInicio}
                onChange={setVigInicio}
                isRequired
              />
              <TextField
                id="vigencia_fim"
                label="Vigência fim"
                type="date"
                value={vigFim}
                onChange={setVigFim}
                isRequired
              />
            </div>

            <TextField
              id="observacoes"
              label="Observações"
              value={observacoes}
              onChange={setObservacoes}
              maxLength={1000}
            />

            <HStack alignItems="center" gap={2} className="mt-2">
              <Button type="submit" color="primary" isLoading={pendente}>
                Salvar
              </Button>
              <Link href={`/veiculos/${veiculoId}/despesas`} style={{ textDecoration: 'none' }}>
                <Button variant="outline" color="default" type="button">
                  Cancelar
                </Button>
              </Link>
            </HStack>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
