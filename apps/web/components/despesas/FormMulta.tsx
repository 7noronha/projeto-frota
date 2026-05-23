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
import type { ItemLookup, MultaResposta } from '@fleetops/types';

type AcaoFormulario = (
  estadoAnterior: { erro?: string } | null,
  formData: FormData,
) => Promise<{ erro?: string } | null>;

interface FormMultaProps {
  veiculoId: number;
  gravidades: ItemLookup[];
  multaInicial?: MultaResposta;
  acao: AcaoFormulario;
  titulo: string;
}

export function FormMulta({
  veiculoId,
  gravidades,
  multaInicial,
  acao,
  titulo,
}: FormMultaProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, setPendente] = useState(false);

  const [gravidadeId, setGravidadeId] = useState<string>(
    multaInicial?.gravidade_multa_id ? String(multaInicial.gravidade_multa_id) : '',
  );
  const [data, setData] = useState(multaInicial?.data ?? '');
  const [valor, setValor] = useState(multaInicial ? String(multaInicial.valor) : '');
  const [descricao, setDescricao] = useState(multaInicial?.descricao ?? '');
  const [numeroAuto, setNumeroAuto] = useState(multaInicial?.numero_auto ?? '');
  const [pontos, setPontos] = useState(
    multaInicial?.pontos_cnh != null ? String(multaInicial.pontos_cnh) : '',
  );
  const [vencimento, setVencimento] = useState(multaInicial?.data_vencimento ?? '');
  const [observacoes, setObservacoes] = useState(multaInicial?.observacoes ?? '');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    if (!gravidadeId) return setErro('Selecione a gravidade');
    setPendente(true);
    const fd = new FormData();
    fd.set('gravidade_multa_id', gravidadeId);
    fd.set('data', data);
    fd.set('valor', valor);
    fd.set('descricao', descricao);
    if (numeroAuto.trim()) fd.set('numero_auto', numeroAuto);
    if (pontos.trim()) fd.set('pontos_cnh', pontos);
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

            <SelectField label="Gravidade" value={gravidadeId} onChange={setGravidadeId}>
              {gravidades.map((g) => (
                <ListBox.Item key={String(g.id)}>{g.nome}</ListBox.Item>
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

            <div className="grid grid-cols-3 gap-4">
              <TextField
                id="numero_auto"
                label="Número do auto"
                value={numeroAuto}
                onChange={setNumeroAuto}
                maxLength={50}
              />
              <TextField
                id="pontos_cnh"
                label="Pontos CNH"
                type="number"
                value={pontos}
                onChange={setPontos}
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
