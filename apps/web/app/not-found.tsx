import Image from 'next/image';
import Link from 'next/link';

export default function NaoEncontrado() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f0f4ff] px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <Image
          src="/404-ilustracao.svg"
          alt="Ilustração de página não encontrada"
          width={380}
          height={280}
          priority
        />

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold" style={{ color: '#0a2540' }}>
            Página não encontrada
          </h1>
          <p className="text-base" style={{ color: '#64748b' }}>
            O endereço que você acessou não existe ou foi movido.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-full px-6 text-sm font-semibold text-white transition-colors"
          style={{ background: '#0066ff', textDecoration: 'none' }}
          onMouseOver={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = '#0047b3')}
          onMouseOut={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = '#0066ff')}
        >
          Voltar para o início
        </Link>
      </div>
    </main>
  );
}
