import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Button, Card } from '@minha-empresa/components-react';
import { ErroApi } from '@/lib/api-servidor';
import { buscarViagemPorId, acaoIniciarViagem, acaoFinalizarViagem } from '../actions';
import { FormIniciarViagem } from '@/components/viagens/FormIniciarViagem';
import { FormFinalizarViagem } from '@/components/viagens/FormFinalizarViagem';

type Params = Promise<{ id: string }>;

type BadgeColor = 'info' | 'warning' | 'success' | 'default';

const ROTULOS_STATUS: Record<string, { texto: string; color: BadgeColor }> = {
  CRIADA: { texto: 'Criada', color: 'info' },
  EM_ANDAMENTO: { texto: 'Em andamento', color: 'warning' },
  FINALIZADA: { texto: 'Finalizada', color: 'success' },
};

function CampoDetalhe({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
        {rotulo}
      </dt>
      <dd className="mt-1 text-sm" style={{ color: '#1e293b' }}>
        {valor ?? '—'}
      </dd>
    </div>
  );
}

export default async function PaginaDetalheViagem(props: { params: Params }) {
  const { id } = await props.params;

  let viagem;
  try {
    viagem = await buscarViagemPorId(id);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) notFound();
    throw erro;
  }

  const rotulo = ROTULOS_STATUS[viagem.status] ?? { texto: viagem.status, color: 'default' as BadgeColor };

  const acaoIniciar = acaoIniciarViagem.bind(null, id);
  const acaoFinalizar = acaoFinalizarViagem.bind(null, id);

  const dataViagem = new Date(viagem.dataViagem + 'T00:00:00').toLocaleDateString('pt-BR');

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fo-navy)]">
            Detalhe da viagem
          </h1>
          <p className="mt-1 text-sm text-[var(--fo-text-secondary)]">
            ID: {viagem.id}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge color={rotulo.color} variant="light" size="lg">{rotulo.texto}</Badge>
          <Link href="/viagens" style={{ textDecoration: 'none' }}>
            <Button variant="outline" color="default" size="sm" leftIcon="PiArrowLeftBold">
              Voltar
            </Button>
          </Link>
        </div>
      </div>

      {/* Informações gerais */}
      <Card>
        <Card.Header className="font-semibold text-base" style={{ color: '#1e293b' }}>
          Informações gerais
        </Card.Header>
        <Card.Body>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <CampoDetalhe rotulo="Destino" valor={viagem.destino} />
            <CampoDetalhe rotulo="Data da viagem" valor={dataViagem} />
            <CampoDetalhe rotulo="Hora início prevista" valor={viagem.horaInicioPrevista} />
            <CampoDetalhe rotulo="Hora fim prevista" valor={viagem.horaFimPrevista} />
            <CampoDetalhe rotulo="Solicitado por" valor={viagem.solicitadoPor} />
            <CampoDetalhe rotulo="Autorizado por" valor={viagem.autorizadoPor} />
            {viagem.observacoes && (
              <div className="col-span-2">
                <CampoDetalhe rotulo="Observações" valor={viagem.observacoes} />
              </div>
            )}
          </dl>
        </Card.Body>
      </Card>

      {/* Motorista e Veículo */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <Card.Header className="font-semibold text-base" style={{ color: '#1e293b' }}>Motorista</Card.Header>
          <Card.Body>
            <dl className="flex flex-col gap-3">
              <CampoDetalhe rotulo="Nome" valor={viagem.motorista.nome} />
              <CampoDetalhe rotulo="Matrícula" valor={viagem.motorista.matricula} />
            </dl>
          </Card.Body>
        </Card>
        <Card>
          <Card.Header className="font-semibold text-base" style={{ color: '#1e293b' }}>Veículo</Card.Header>
          <Card.Body>
            <dl className="flex flex-col gap-3">
              <CampoDetalhe rotulo="Placa" valor={<span className="font-mono">{viagem.veiculo.placa}</span>} />
              <CampoDetalhe rotulo="Modelo" valor={`${viagem.veiculo.marca} ${viagem.veiculo.modelo}`} />
            </dl>
          </Card.Body>
        </Card>
      </div>

      {/* Execução */}
      {viagem.status !== 'CRIADA' && (
        <Card>
          <Card.Header className="font-semibold text-base" style={{ color: '#1e293b' }}>Execução</Card.Header>
          <Card.Body>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <CampoDetalhe
                rotulo="Início real"
                valor={viagem.dataHoraInicioReal ? new Date(viagem.dataHoraInicioReal).toLocaleString('pt-BR') : null}
              />
              <CampoDetalhe
                rotulo="Fim real"
                valor={viagem.dataHoraFimReal ? new Date(viagem.dataHoraFimReal).toLocaleString('pt-BR') : null}
              />
              <CampoDetalhe
                rotulo="Odômetro inicial"
                valor={viagem.odometroInicial != null ? `${viagem.odometroInicial.toLocaleString('pt-BR')} km` : null}
              />
              <CampoDetalhe
                rotulo="Odômetro final"
                valor={viagem.odometroFinal != null ? `${viagem.odometroFinal.toLocaleString('pt-BR')} km` : null}
              />
              {viagem.distanciaPercorrida != null && (
                <div className="col-span-2">
                  <CampoDetalhe
                    rotulo="Distância percorrida"
                    valor={`${viagem.distanciaPercorrida.toLocaleString('pt-BR')} km`}
                  />
                </div>
              )}
            </dl>
          </Card.Body>
        </Card>
      )}

      {/* Ação: Iniciar */}
      {viagem.status === 'CRIADA' && (
        <Card style={{ borderColor: '#bfdbfe', background: '#eff6ff' }}>
          <Card.Header className="font-semibold text-base" style={{ color: '#1e40af' }}>
            Iniciar viagem
          </Card.Header>
          <Card.Body>
            <FormIniciarViagem
              acao={acaoIniciar}
              odometroAtualVeiculo={viagem.veiculo.odometroAtual}
            />
          </Card.Body>
        </Card>
      )}

      {/* Ação: Finalizar */}
      {viagem.status === 'EM_ANDAMENTO' && viagem.odometroInicial != null && (
        <Card style={{ borderColor: '#fde68a', background: '#fffbeb' }}>
          <Card.Header className="font-semibold text-base" style={{ color: '#92400e' }}>
            Finalizar viagem
          </Card.Header>
          <Card.Body>
            <FormFinalizarViagem acao={acaoFinalizar} odometroInicial={viagem.odometroInicial} />
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
