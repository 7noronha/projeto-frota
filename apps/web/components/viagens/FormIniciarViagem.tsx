'use client';

import { useActionState, useState } from 'react';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

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

      <div className="flex flex-col gap-2">
        <label htmlFor="odometroInicial" className="text-sm font-medium" style={{ color: '#1e3a5f' }}>
          Odômetro inicial (km) <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <InputNumber
          inputId="odometroInicial"
          value={odometro}
          onValueChange={(e: InputNumberValueChangeEvent) => setOdometro(e.value ?? odometroAtualVeiculo)}
          min={odometroAtualVeiculo}
          showButtons
          buttonLayout="horizontal"
          step={1}
          suffix=" km"
          locale="pt-BR"
          className="w-full"
          inputClassName="w-full"
        />
        <p className="text-xs" style={{ color: '#64748b' }}>
          Odômetro atual do veículo: {odometroAtualVeiculo.toLocaleString('pt-BR')} km
        </p>
      </div>

      {estado?.erro && (
        <Message severity="error" text={estado.erro} className="w-full justify-start" />
      )}

      <Button
        type="submit"
        label={pendente ? 'Iniciando...' : 'Iniciar viagem'}
        loading={pendente}
        icon="pi pi-play"
        className="w-full"
      />
    </form>
  );
}
