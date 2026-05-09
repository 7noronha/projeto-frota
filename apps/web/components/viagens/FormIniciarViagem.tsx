'use client';

import { useActionState, useState } from 'react';
import { NumberField, Button, Alert } from '@lojascem/components-react';

type AcaoFormulario = (
  estadoAnterior: { erro?: string } | null,
  formData: FormData,
) => Promise<{ erro?: string } | null>;

interface FormIniciarViagemProps {
  acao: AcaoFormulario;
  odometroAtualVeiculo: number;
}

export function FormIniciarViagem({ acao, odometroAtualVeiculo }: FormIniciarViagemProps) {
  const [estado, acaoForm, pendente] = useActionState(acao, null);
  const [odometro, setOdometro] = useState<number>(odometroAtualVeiculo);

  return (
    <form action={acaoForm} className="flex flex-col gap-4">
      <input type="hidden" name="odometroInicial" value={odometro} />

      <NumberField
        id="odometroInicial"
        label="Odômetro inicial (km)"
        isRequired
        value={odometro}
        onChange={(v) => setOdometro(v ?? odometroAtualVeiculo)}
        minValue={odometroAtualVeiculo}
        step={1}
        control
        description={`Odômetro atual do veículo: ${odometroAtualVeiculo.toLocaleString('pt-BR')} km`}
      />

      {estado?.erro && (
        <Alert color="error">{estado.erro}</Alert>
      )}

      <Button
        type="submit"
        color="primary"
        isBlock
        isLoading={pendente}
        leftIcon="PiPlayBold"
      >
        {pendente ? 'Iniciando...' : 'Iniciar viagem'}
      </Button>
    </form>
  );
}
