import { TabelaSkeleton } from '@/components/TabelaSkeleton';

export default function Loading() {
  return <TabelaSkeleton colunas={[100, 180, 120, 140, 70, 200]} linhas={6} />;
}
