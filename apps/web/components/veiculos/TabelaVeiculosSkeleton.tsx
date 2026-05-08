import { HStack, Placeload } from '@minha-empresa/components-react';

export function TabelaVeiculosSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-xl" style={{ border: '1px solid #e2e8f0' }}>
      {/* Header */}
      <HStack gap="6" className="px-4 py-3" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        {[80, 140, 70, 60, 100, 90, 100].map((w, i) => (
          <Placeload key={i} width={w} height={12} rounded />
        ))}
      </HStack>

      {/* Linhas */}
      {Array.from({ length: 6 }).map((_, i) => (
        <HStack
          key={i}
          align="center"
          gap="6"
          className="px-4 py-4"
          style={{
            borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none',
            background: i % 2 === 0 ? '#ffffff' : '#fafafa',
          }}
        >
          <Placeload width={80} height={16} />
          <Placeload width={140} height={16} />
          <Placeload width={70} height={16} />
          <Placeload width={60} height={16} />
          <Placeload width={100} height={16} />
          <Placeload width={70} height={20} rounded />
          <Placeload width={100} height={16} />
        </HStack>
      ))}
    </div>
  );
}
