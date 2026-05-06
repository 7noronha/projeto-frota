'use client';

import { useActionState, useState } from 'react';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

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

      <div className="flex flex-col gap-2">
        <label htmlFor="odometroFinal" className="text-sm font-medium" style={{ color: '#78350f' }}>
          Odômetro final (km) <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <InputNumber
          inputId="odometroFinal"
          value={odometro}
          onValueChange={(e: InputNumberValueChangeEvent) => setOdometro(e.value ?? odometroInicial + 1)}
          min={odometroInicial + 1}
          showButtons
          buttonLayout="horizontal"
          step={1}
          suffix=" km"
          locale="pt-BR"
          className="w-full"
          inputClassName="w-full"
        />
        <p className="text-xs" style={{ color: '#64748b' }}>
          Odômetro na saída: {odometroInicial.toLocaleString('pt-BR')} km
        </p>
      </div>

      {estado?.erro && (
        <Message severity="error" text={estado.erro} className="w-full justify-start" />
      )}

      <Button
        type="submit"
        label={pendente ? 'Finalizando...' : 'Finalizar viagem'}
        loading={pendente}
        icon="pi pi-flag-fill"
        severity="success"
        className="w-full"
      />
    </form>
  );
}
