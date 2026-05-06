'use client';

import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

interface DialogConfirmacaoProps {
  visivel: boolean;
  titulo: string;
  descricao: string;
  palavraConfirmacao: string;
  labelConfirmar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  carregando?: boolean;
}

export function DialogConfirmacao({
  visivel,
  titulo,
  descricao,
  palavraConfirmacao,
  labelConfirmar = 'Excluir',
  onConfirmar,
  onCancelar,
  carregando = false,
}: DialogConfirmacaoProps) {
  const [texto, setTexto] = useState('');
  const confirmado = texto === palavraConfirmacao;

  function handleHide() {
    if (!carregando) {
      setTexto('');
      onCancelar();
    }
  }

  function handleConfirmar() {
    if (confirmado) onConfirmar();
  }

  return (
    <Dialog
      visible={visivel}
      onHide={handleHide}
      header={titulo}
      style={{ width: 440 }}
      closable={!carregando}
      modal
    >
      <p className="text-sm mb-5" style={{ color: '#475569' }}>
        {descricao}
      </p>

      <label
        htmlFor="confirmacao-texto"
        className="text-sm font-medium"
        style={{ color: '#374151' }}
      >
        Digite <strong>{palavraConfirmacao}</strong> para confirmar
      </label>
      <InputText
        id="confirmacao-texto"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className="w-full mt-2"
        autoComplete="off"
        placeholder={palavraConfirmacao}
        disabled={carregando}
      />

      <div className="flex justify-end gap-3 mt-6">
        <Button
          label="Cancelar"
          outlined
          severity="secondary"
          onClick={handleHide}
          disabled={carregando}
          type="button"
        />
        <Button
          label={carregando ? 'Excluindo...' : labelConfirmar}
          severity="danger"
          loading={carregando}
          disabled={!confirmado || carregando}
          onClick={handleConfirmar}
          type="button"
        />
      </div>
    </Dialog>
  );
}
