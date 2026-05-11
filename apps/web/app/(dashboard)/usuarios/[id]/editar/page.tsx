import { notFound } from 'next/navigation';
import { ErroApi } from '@/lib/api-servidor';
import { buscarUsuarioPorId, acaoAtualizarUsuario } from '../../actions';
import { FormUsuario } from '@/components/usuarios/FormUsuario';

type Params = Promise<{ id: string }>;

export const dynamic = 'force-dynamic';

export default async function PaginaEditarUsuario(props: { params: Params }) {
  const { id } = await props.params;

  let usuario;
  try {
    usuario = await buscarUsuarioPorId(id);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  const acao = acaoAtualizarUsuario.bind(null, id);

  return <FormUsuario acao={acao} usuarioInicial={usuario} titulo={`Editar — ${usuario.nome}`} />;
}
