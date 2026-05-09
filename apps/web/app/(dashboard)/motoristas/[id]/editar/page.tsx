import { notFound } from 'next/navigation';
import { FormMotorista } from '@/components/motoristas/FormMotorista';
import { buscarMotoristaPorId, acaoAtualizarMotorista } from '../../actions';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PaginaEditarMotorista({ params }: Props) {
  const { id } = await params;

  let motorista;
  try {
    motorista = await buscarMotoristaPorId(id);
  } catch {
    notFound();
  }

  const acaoAtualizar = acaoAtualizarMotorista.bind(null, id);

  return (
    <FormMotorista
      acao={acaoAtualizar}
      motoristaInicial={motorista}
      titulo="Editar motorista"
    />
  );
}
