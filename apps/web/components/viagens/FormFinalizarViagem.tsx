'use client';

import { useActionState, useState } from 'react';
import { NumberField, Button, Alert } from '@lojascem/components-react';

type AcaoFormulario = (
  estadoAnterior: { erro?: string } | null,
  formData: FormData,
) => Promise<{ erro?: string } | null>;

interface FormFinalizarViagemProps {
  acao: AcaoFormulario;
  odometroInicial: number;
}

export function FormFinalizarViagem({ acao, odometroInicial }: FormFinalizarViagemProps) {
  const [estado, acaoForm, pendente] = useActionState(acao, null);
  const [odometro, setOdometro] = useState<number>(odometroInicial + 1);

  return (
    <form action={acaoForm} className="flex flex-col gap-4">
      <input type="hidden" name="odometroFinal" value={odometro} />

      <NumberField
        id="odometroFinal"
        label="Odômetro final (km)"
        isRequired
        value={odometro}
        onChange={(v) => setOdometro(v ?? odometroInicial + 1)}
        minValue={odometroInicial + 1}
        step={1}
        control
        description={`Odômetro na saída: ${odometroInicial.toLocaleString('pt-BR')} km`}
      />

      {estado?.erro && (
        <Alert color="error">{estado.erro}</Alert>
      )}

      <Button
        type="submit"
        color="success"
        isBlock
        isLoading={pendente}
        leftIcon="PiFlagBold"
      >
        {pendente ? 'Finalizando...' : 'Finalizar viagem'}
      </Button>
    </form>
  );
}
