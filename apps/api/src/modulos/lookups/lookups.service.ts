import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { ItemLookup } from '@fleetops/types';

// Tabelas auxiliares expostas via GET /lookups/:nome.
// Mantém um whitelist explícito — qualquer outro nome devolve 400.
const TABELAS = {
  perfis_usuario: 'perfis_usuario',
  situacoes_veiculo: 'situacoes_veiculo',
  status_viagem: 'status_viagem',
  tipos_combustivel: 'tipos_combustivel',
  tipos_manutencao: 'tipos_manutencao',
  gravidades_multa: 'gravidades_multa',
  tipos_imposto: 'tipos_imposto',
  tipos_cobertura_seguro: 'tipos_cobertura_seguro',
  tipos_documento_veiculo: 'tipos_documento_veiculo',
} as const;

export type NomeLookup = keyof typeof TABELAS;

@Injectable()
export class LookupsService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(nome: string): Promise<ItemLookup[]> {
    if (!(nome in TABELAS)) {
      throw new BadRequestException(
        `Lookup desconhecido: "${nome}". Disponíveis: ${Object.keys(TABELAS).join(', ')}`,
      );
    }

    // Delegação dinâmica — cada tabela compartilha a mesma forma { id, nome, descricao }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = (this.prisma as any)[nome];
    const registros: Array<{ id: number; nome: string; descricao: string | null }> =
      await delegate.findMany({
        orderBy: { id: 'asc' },
        select: { id: true, nome: true, descricao: true },
      });
    return registros;
  }
}
