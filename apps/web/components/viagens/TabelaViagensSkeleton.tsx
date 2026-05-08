import { HStack, Placeload } from '@minha-empresa/components-react';

export function TabelaViagensSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-xl" style={{ border: '1px solid #e2e8f0' }}>
      {/* Header */}
      <HStack gap="6" className="px-4 py-3" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        {[70, 160, 140, 80, 120, 90, 100].map((w, i) => (
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
          <Placeload width={70} height={16} />
          <Placeload width={160} height={16} />
          <Placeload width={140} height={16} />
          <Placeload width={80} height={16} />
          <Placeload width={120} height={16} />
          <Placeload width={80} height={20} rounded />
          <Placeload width={80} height={16} />
        </HStack>
      ))}
    </div>
  );
}
