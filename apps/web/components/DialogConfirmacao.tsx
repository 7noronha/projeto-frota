'use client';

import { useState } from 'react';
import { Modal, TextField, Button, HStack, Text } from '@minha-empresa/components-react';

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

  function handleClose() {
    if (!carregando) {
      setTexto('');
      onCancelar();
    }
  }

  function handleConfirmar() {
    if (confirmado) onConfirmar();
  }

  return (
    <Modal
      isOpen={visivel}
      onClose={handleClose}
      title={titulo}
      size="sm"
      hideCloseButton={carregando}
      footer={
        <HStack justify="end" gap="3">
          <Button
            variant="outline"
            color="default"
            onClick={handleClose}
            disabled={carregando}
            type="button"
          >
            Cancelar
          </Button>
          <Button
            color="error"
            isLoading={carregando}
            disabled={!confirmado || carregando}
            onClick={handleConfirmar}
            type="button"
          >
            {carregando ? 'Excluindo...' : labelConfirmar}
          </Button>
        </HStack>
      }
    >
      <Text size="sm" className="mb-5" style={{ color: '#475569' }}>
        {descricao}
      </Text>

      <TextField
        id="confirmacao-texto"
        label={`Digite "${palavraConfirmacao}" para confirmar`}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        autoComplete="off"
        placeholder={palavraConfirmacao}
        isDisabled={carregando}
      />
    </Modal>
  );
}
