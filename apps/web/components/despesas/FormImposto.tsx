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
import type { ImpostoResposta, ItemLookup } from '@fleetops/types';

type AcaoFormulario = (
  estadoAnterior: { erro?: string } | null,
  formData: FormData,
) => Promise<{ erro?: string } | null>;

interface FormImpostoProps {
  veiculoId: number;
  tiposImposto: ItemLookup[];
  impostoInicial?: ImpostoResposta;
  acao: AcaoFormulario;
  titulo: string;
}

export function FormImposto({
  veiculoId,
  tiposImposto,
  impostoInicial,
  acao,
  titulo,
}: FormImpostoProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, setPendente] = useState(false);

  const anoAtual = new Date().getFullYear();
  const [tipoId, setTipoId] = useState<string>(
    impostoInicial?.tipo_imposto_id ? String(impostoInicial.tipo_imposto_id) : '',
  );
  const [data, setData] = useState(impostoInicial?.data ?? '');
  const [valor, setValor] = useState(impostoInicial ? String(impostoInicial.valor) : '');
  const [descricao, setDescricao] = useState(impostoInicial?.descricao ?? '');
  const [anoExercicio, setAnoExercicio] = useState(
    impostoInicial ? String(impostoInicial.ano_exercicio) : String(anoAtual),
  );
  const [numParcela, setNumParcela] = useState(
    impostoInicial?.numero_parcela != null ? String(impostoInicial.numero_parcela) : '',
  );
  const [totParcelas, setTotParcelas] = useState(
    impostoInicial?.total_parcelas != null ? String(impostoInicial.total_parcelas) : '',
  );
  const [vencimento, setVencimento] = useState(impostoInicial?.data_vencimento ?? '');
  const [observacoes, setObservacoes] = useState(impostoInicial?.observacoes ?? '');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    if (!tipoId) return setErro('Selecione o tipo de imposto');
    setPendente(true);
    const fd = new FormData();
    fd.set('tipo_imposto_id', tipoId);
    fd.set('data', data);
    fd.set('valor', valor);
    fd.set('descricao', descricao);
    fd.set('ano_exercicio', anoExercicio);
    if (numParcela.trim()) fd.set('numero_parcela', numParcela);
    if (totParcelas.trim()) fd.set('total_parcelas', totParcelas);
    if (vencimento.trim()) fd.set('data_vencimento', vencimento);
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

            <SelectField label="Tipo de imposto" value={tipoId} onChange={setTipoId}>
              {tiposImposto.map((t) => (
                <ListBox.Item key={String(t.id)}>{t.nome}</ListBox.Item>
              ))}
            </SelectField>

            <div className="grid grid-cols-3 gap-4">
              <TextField
                id="ano_exercicio"
                label="Ano de exercício"
                type="number"
                value={anoExercicio}
                onChange={setAnoExercicio}
                isRequired
              />
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

            <div className="grid grid-cols-3 gap-4">
              <TextField
                id="numero_parcela"
                label="Parcela atual"
                type="number"
                value={numParcela}
                onChange={setNumParcela}
              />
              <TextField
                id="total_parcelas"
                label="Total de parcelas"
                type="number"
                value={totParcelas}
                onChange={setTotParcelas}
              />
              <TextField
                id="data_vencimento"
                label="Vencimento"
                type="date"
                value={vencimento}
                onChange={setVencimento}
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
