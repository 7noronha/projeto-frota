import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { RelatoriosService } from './relatorios.service';
import { FiltrosPeriodoDto } from './dto/filtros-periodo.dto';
import {
  AgregadoMotoristaDto,
  AgregadoVeiculoDto,
} from './dto/agregado-resposta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Relatórios')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('distancia-por-motorista')
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Km percorrido agregado por motorista no período' })
  @ApiOkResponse({ type: [AgregadoMotoristaDto] })
  @ApiForbiddenResponse({ description: 'Motoristas não têm acesso a relatórios' })
  async distanciaPorMotorista(
    @Query() filtros: FiltrosPeriodoDto,
  ): Promise<AgregadoMotoristaDto[]> {
    return this.relatoriosService.distanciaPorMotorista(filtros);
  }

  @Get('distancia-por-veiculo')
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Km percorrido agregado por veículo no período' })
  @ApiOkResponse({ type: [AgregadoVeiculoDto] })
  async distanciaPorVeiculo(
    @Query() filtros: FiltrosPeriodoDto,
  ): Promise<AgregadoVeiculoDto[]> {
    return this.relatoriosService.distanciaPorVeiculo(filtros);
  }
}
