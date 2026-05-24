import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ItemLookup } from '@fleetops/types';
import { LookupsService } from './lookups.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Lookups')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('lookups')
export class LookupsController {
  constructor(private readonly service: LookupsService) {}

  @Get(':nome')
  @ApiOperation({
    summary: 'Lista itens de uma tabela de lookup (perfis_usuario, status_viagem, etc.)',
    description:
      'Tabelas disponíveis: perfis_usuario, situacoes_veiculo, status_viagem, ' +
      'tipos_combustivel, tipos_manutencao, gravidades_multa, tipos_imposto, ' +
      'tipos_cobertura_seguro, tipos_documento_veiculo.',
  })
  @ApiOkResponse({ description: 'Array de { id, nome, descricao }' })
  async listar(@Param('nome') nome: string): Promise<ItemLookup[]> {
    return this.service.listar(nome);
  }
}
