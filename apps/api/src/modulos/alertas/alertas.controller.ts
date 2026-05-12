import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AlertasService, Alerta } from './alertas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Alertas')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Get()
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Eventos críticos consolidados (CNHs vencendo, viagens atrasadas)' })
  @ApiOkResponse({ description: 'Lista de alertas ordenada por severidade' })
  @ApiForbiddenResponse({ description: 'Motoristas não têm acesso a alertas' })
  async listar(): Promise<Alerta[]> {
    return this.alertasService.listar();
  }
}
