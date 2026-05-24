'use client';

import { useActionState, useState } from 'react';
import { NumberField, Button, Alert } from '@lojascem/components-react';

type AcaoFormulario = (
  estadoAnterior: { erro?: string } | null,
  formData: FormData,
) => Promise<{ erro?: string } | null>;

interface FormFinalizarViagemProps {
  acao: AcaoFormulario;
  odometro_inicial: number;
}

export function FormFinalizarViagem({ acao, odometro_inicial }: FormFinalizarViagemProps) {
  const [estado, acaoForm, pendente] = useActionState(acao, null);
  const [odometro, setOdometro] = useState<number>(odometro_inicial + 1);

  return (
    <form action={acaoForm} className="flex flex-col gap-4">
      <input type="hidden" name="odometro_final" value={odometro} />

      <NumberField
        id="odometro_final"
        label="Odômetro final (km)"
        isRequired
        value={odometro}
        onChange={(v) => setOdometro(v ?? odometro_inicial + 1)}
        minValue={odometro_inicial + 1}
        step={1}
        control
        description={`Odômetro na saída: ${odometro_inicial.toLocaleString('pt-BR')} km`}
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
