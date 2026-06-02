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
import type { DocumentacaoResposta, ItemLookup } from '@fleetops/types';

type AcaoFormulario = (
  estadoAnterior: { erro?: string } | null,
  formData: FormData,
) => Promise<{ erro?: string } | null>;

interface FormDocumentacaoProps {
  veiculoId: number;
  tiposDocumento: ItemLookup[];
  documentacaoInicial?: DocumentacaoResposta;
  acao: AcaoFormulario;
  titulo: string;
}

export function FormDocumentacao({
  veiculoId,
  tiposDocumento,
  documentacaoInicial,
  acao,
  titulo,
}: FormDocumentacaoProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, setPendente] = useState(false);

  const [tipoId, setTipoId] = useState<string>(
    documentacaoInicial?.tipo_documento_veiculo_id
      ? String(documentacaoInicial.tipo_documento_veiculo_id)
      : '',
  );
  const [data, setData] = useState(documentacaoInicial?.data ?? '');
  const [valor, setValor] = useState(documentacaoInicial ? String(documentacaoInicial.valor) : '');
  const [descricao, setDescricao] = useState(documentacaoInicial?.descricao ?? '');
  const [vencimento, setVencimento] = useState(documentacaoInicial?.data_vencimento ?? '');
  const [observacoes, setObservacoes] = useState(documentacaoInicial?.observacoes ?? '');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    if (!tipoId) return setErro('Selecione o tipo de documento');
    setPendente(true);
    const fd = new FormData();
    fd.set('tipo_documento_veiculo_id', tipoId);
    fd.set('data', data);
    fd.set('valor', valor);
    fd.set('descricao', descricao);
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

            <SelectField label="Tipo de documento" isBlock value={tipoId} onChange={setTipoId}>
              {tiposDocumento.map((t) => (
                <ListBox.Item key={String(t.id)}>{t.nome}</ListBox.Item>
              ))}
            </SelectField>

            <div className="grid grid-cols-3 gap-4">
              <TextField id="data" label="Emissão" type="date" value={data} onChange={setData} isRequired />
              <TextField
                id="data_vencimento"
                label="Vencimento"
                type="date"
                value={vencimento}
                onChange={setVencimento}
              />
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
