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
import type { ManutencaoResposta, ItemLookup } from '@fleetops/types';

type AcaoFormulario = (
  estadoAnterior: { erro?: string } | null,
  formData: FormData,
) => Promise<{ erro?: string } | null>;

interface FormManutencaoProps {
  veiculoId: number;
  tiposManutencao: ItemLookup[];
  manutencaoInicial?: ManutencaoResposta;
  acao: AcaoFormulario;
  titulo: string;
}

export function FormManutencao({
  veiculoId,
  tiposManutencao,
  manutencaoInicial,
  acao,
  titulo,
}: FormManutencaoProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, setPendente] = useState(false);

  const [tipoId, setTipoId] = useState<string>(
    manutencaoInicial?.tipo_manutencao_id ? String(manutencaoInicial.tipo_manutencao_id) : '',
  );
  const [data, setData] = useState(manutencaoInicial?.data ?? '');
  const [valor, setValor] = useState(manutencaoInicial ? String(manutencaoInicial.valor) : '');
  const [descricao, setDescricao] = useState(manutencaoInicial?.descricao ?? '');
  const [oficina, setOficina] = useState(manutencaoInicial?.oficina ?? '');
  const [odometro, setOdometro] = useState(
    manutencaoInicial?.odometro != null ? String(manutencaoInicial.odometro) : '',
  );
  const [observacoes, setObservacoes] = useState(manutencaoInicial?.observacoes ?? '');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    if (!tipoId) return setErro('Selecione o tipo de manutenção');
    setPendente(true);
    const fd = new FormData();
    fd.set('tipo_manutencao_id', tipoId);
    fd.set('data', data);
    fd.set('valor', valor);
    fd.set('descricao', descricao);
    if (oficina.trim()) fd.set('oficina', oficina);
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

            <SelectField label="Tipo de manutenção" isBlock value={tipoId} onChange={setTipoId}>
              {tiposManutencao.map((t) => (
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
              <TextField id="oficina" label="Oficina" value={oficina} onChange={setOficina} maxLength={200} />
              <TextField
                id="odometro"
                label="Odômetro (km)"
                type="number"
                value={odometro}
                onChange={setOdometro}
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
