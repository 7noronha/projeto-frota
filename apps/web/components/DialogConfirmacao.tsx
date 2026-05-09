'use client';

import { useState, useEffect, useRef } from 'react';
import { TextField, Button, HStack, Text } from '@lojascem/components-react';

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
  const confirmado = texto.toUpperCase() === palavraConfirmacao.toUpperCase();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (visivel) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [visivel]);

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
    <dialog ref={dialogRef} onClose={handleClose}>
      <div style={{ padding: '24px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 16, marginTop: 0 }}>
          {titulo}
        </h2>
        <Text size="sm" className="mb-5" style={{ color: '#475569' }}>
          {descricao}
        </Text>
        <TextField
          label={`Digite "${palavraConfirmacao}" para confirmar`}
          value={texto}
          onChange={(value) => setTexto(value.toUpperCase())}
          autoComplete="off"
          placeholder={palavraConfirmacao}
          isDisabled={carregando}
        />
        <HStack justifyContent="end" gap={4} className="mt-5">
          <Button
            variant="outline"
            color="default"
            onPress={handleClose}
            isDisabled={carregando}
          >
            Cancelar
          </Button>
          <Button
            color="error"
            isLoading={carregando}
            isDisabled={!confirmado || carregando}
            onPress={handleConfirmar}
          >
            {carregando ? 'Excluindo...' : labelConfirmar}
          </Button>
        </HStack>
      </div>
    </dialog>
  );
}
