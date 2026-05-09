import { FormMotorista } from '@/components/motoristas/FormMotorista';
import { acaoCriarMotorista } from '../actions';

export default function PaginaNovoMotorista() {
  return <FormMotorista acao={acaoCriarMotorista} titulo="Cadastrar motorista" />;
}
