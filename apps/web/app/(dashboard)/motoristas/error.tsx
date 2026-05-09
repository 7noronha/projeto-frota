'use client';

import { EstadoErro } from '@/components/EstadoErro';

export default function ErroMotoristas({ reset }: { error: Error; reset: () => void }) {
  return (
    <EstadoErro
      titulo="Erro ao carregar motoristas"
      descricao="Não foi possível buscar a lista de motoristas. Verifique sua conexão e tente novamente."
      onTentarNovamente={reset}
    />
  );
}
