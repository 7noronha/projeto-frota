import { FormUsuario } from '@/components/usuarios/FormUsuario';
import { acaoCriarUsuario } from '../actions';

export default function PaginaNovoUsuario() {
  return <FormUsuario acao={acaoCriarUsuario} titulo="Novo usuário" />;
}
