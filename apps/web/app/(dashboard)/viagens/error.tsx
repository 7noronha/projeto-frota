'use client';

import { EstadoErro } from '@/components/EstadoErro';

export default function ErrorViagens({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <EstadoErro
      titulo="Não conseguimos carregar as viagens"
      descricao="Verifique sua conexão e tente novamente. Se o problema persistir, contate o suporte."
      onTentarNovamente={reset}
    />
  );
}
