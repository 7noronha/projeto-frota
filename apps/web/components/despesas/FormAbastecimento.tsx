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
import type { AbastecimentoResposta, ItemLookup } from '@fleetops/types';

type AcaoFormulario = (
  estadoAnterior: { erro?: string } | null,
  formData: FormData,
) => Promise<{ erro?: string } | null>;

interface FormAbastecimentoProps {
  veiculoId: number;
  tiposCombustivel: ItemLookup[];
  abastecimentoInicial?: AbastecimentoResposta;
  acao: AcaoFormulario;
  titulo: string;
}

export function FormAbastecimento({
  veiculoId,
  tiposCombustivel,
  abastecimentoInicial,
  acao,
  titulo,
}: FormAbastecimentoProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, setPendente] = useState(false);

  const [tipoId, setTipoId] = useState<string>(
    abastecimentoInicial?.tipo_combustivel_id ? String(abastecimentoInicial.tipo_combustivel_id) : '',
  );
  const [data, setData] = useState(abastecimentoInicial?.data ?? '');
  const [litros, setLitros] = useState(
    abastecimentoInicial ? String(abastecimentoInicial.litros) : '',
  );
  const [precoLitro, setPrecoLitro] = useState(
    abastecimentoInicial ? String(abastecimentoInicial.preco_litro) : '',
  );
  const [valor, setValor] = useState(abastecimentoInicial ? String(abastecimentoInicial.valor) : '');
  const [odometro, setOdometro] = useState(
    abastecimentoInicial?.odometro != null ? String(abastecimentoInicial.odometro) : '',
  );
  const [descricao, setDescricao] = useState(abastecimentoInicial?.descricao ?? 'Abastecimento');
  const [observacoes, setObservacoes] = useState(abastecimentoInicial?.observacoes ?? '');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    if (!tipoId) return setErro('Selecione o tipo de combustível');
    setPendente(true);
    const fd = new FormData();
    fd.set('tipo_combustivel_id', tipoId);
    fd.set('data', data);
    fd.set('valor', valor);
    fd.set('litros', litros);
    fd.set('preco_litro', precoLitro);
    fd.set('descricao', descricao);
    if (odometro.trim()) fd.set('odometro', odometro);
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

            <SelectField label="Tipo de combustível" value={tipoId} onChange={setTipoId}>
              {tiposCombustivel.map((t) => (
                <ListBox.Item key={String(t.id)}>{t.nome}</ListBox.Item>
              ))}
            </SelectField>

            <div className="grid grid-cols-2 gap-4">
              <TextField id="data" label="Data" type="date" value={data} onChange={setData} isRequired />
              <TextField
                id="odometro"
                label="Odômetro (km)"
                type="number"
                value={odometro}
                onChange={setOdometro}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <TextField
                id="litros"
                label="Litros"
                type="number"
                value={litros}
                onChange={setLitros}
                isRequired
              />
              <TextField
                id="preco_litro"
                label="Preço/L (R$)"
                type="number"
                value={precoLitro}
                onChange={setPrecoLitro}
                isRequired
              />
              <TextField
                id="valor"
                label="Total (R$)"
                type="number"
                value={valor}
                onChange={setValor}
                isRequired
              />
            </div>

            <TextField id="descricao" label="Descrição" value={descricao} onChange={setDescricao} />

            <TextField
              id="observacoes"
              label="Observações"
              value={observacoes}
              onChange={setObservacoes}
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
