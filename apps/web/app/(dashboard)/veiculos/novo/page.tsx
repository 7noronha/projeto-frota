import { FormVeiculo } from '@/components/veiculos/FormVeiculo';
import { acaoCriarVeiculo } from '../actions';

export default function PaginaNovoVeiculo() {
  return <FormVeiculo acao={acaoCriarVeiculo} titulo="Cadastrar veículo" />;
}
