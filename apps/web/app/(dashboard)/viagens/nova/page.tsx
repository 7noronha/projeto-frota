import { buscarMotoristas, buscarVeiculosAtivos } from '../actions';
import { FormViagem } from '@/components/viagens/FormViagem';
import { acaoCriarViagem } from '../actions';

export default async function PaginaNovaViagem() {
  const [motoristas, veiculos] = await Promise.all([buscarMotoristas(), buscarVeiculosAtivos()]);

  return <FormViagem acao={acaoCriarViagem} motoristas={motoristas} veiculos={veiculos} />;
}
