import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ErroApi } from '@/lib/api-servidor';
import { buscarViagemPorId, acaoIniciarViagem, acaoFinalizarViagem } from '../actions';
import { FormIniciarViagem } from '@/components/viagens/FormIniciarViagem';
import { FormFinalizarViagem } from '@/components/viagens/FormFinalizarViagem';

type Params = Promise<{ id: string }>;

type SeveridadeTag = 'info' | 'warning' | 'success' | 'danger' | undefined;

const ROTULOS_STATUS: Record<string, { texto: string; severity: SeveridadeTag }> = {
  CRIADA: { texto: 'Criada', severity: 'info' },
  EM_ANDAMENTO: { texto: 'Em andamento', severity: 'warning' },
  FINALIZADA: { texto: 'Finalizada', severity: 'success' },
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

  const rotulo = ROTULOS_STATUS[viagem.status] ?? { texto: viagem.status, severity: undefined };

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
          <Tag value={rotulo.texto} severity={rotulo.severity} style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }} />
          <Link href="/viagens" style={{ textDecoration: 'none' }}>
            <Button label="Voltar" icon="pi pi-arrow-left" severity="secondary" outlined size="small" />
          </Link>
        </div>
      </div>

      {/* Informações gerais */}
      <Card title="Informações gerais">
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
      </Card>

      {/* Motorista e Veículo */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Motorista">
          <dl className="flex flex-col gap-3">
            <CampoDetalhe rotulo="Nome" valor={viagem.motorista.nome} />
            <CampoDetalhe rotulo="Matrícula" valor={viagem.motorista.matricula} />
          </dl>
        </Card>
        <Card title="Veículo">
          <dl className="flex flex-col gap-3">
            <CampoDetalhe rotulo="Placa" valor={<span className="font-mono">{viagem.veiculo.placa}</span>} />
            <CampoDetalhe rotulo="Modelo" valor={`${viagem.veiculo.marca} ${viagem.veiculo.modelo}`} />
          </dl>
        </Card>
      </div>

      {/* Execução */}
      {viagem.status !== 'CRIADA' && (
        <Card title="Execução">
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
        </Card>
      )}

      {/* Ação: Iniciar */}
      {viagem.status === 'CRIADA' && (
        <Card
          title="Iniciar viagem"
          style={{ borderColor: '#bfdbfe', background: '#eff6ff' }}
          pt={{ title: { style: { color: '#1e40af' } } }}
        >
          <FormIniciarViagem
            acao={acaoIniciar}
            odometroAtualVeiculo={viagem.veiculo.odometroAtual}
          />
        </Card>
      )}

      {/* Ação: Finalizar */}
      {viagem.status === 'EM_ANDAMENTO' && viagem.odometroInicial != null && (
        <Card
          title="Finalizar viagem"
          style={{ borderColor: '#fde68a', background: '#fffbeb' }}
          pt={{ title: { style: { color: '#92400e' } } }}
        >
          <FormFinalizarViagem acao={acaoFinalizar} odometroInicial={viagem.odometroInicial} />
        </Card>
      )}
    </div>
  );
}
