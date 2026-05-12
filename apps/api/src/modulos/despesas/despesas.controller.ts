import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { DespesasService } from './despesas.service';
import { CriarDespesaDto } from './dto/criar-despesa.dto';
import { AtualizarDespesaDto } from './dto/atualizar-despesa.dto';
import { DespesaRespostaDto } from './dto/despesa-resposta.dto';
import { FiltrosListarDespesasDto } from './dto/filtros-listar-despesas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { RespostaPaginada } from '@fleetops/types';

@ApiTags('Despesas de Veículo')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('despesas')
export class DespesasController {
  constructor(private readonly despesasService: DespesasService) {}

  @Get()
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Lista despesas com filtros e paginação' })
  @ApiOkResponse({ description: 'Lista paginada de despesas' })
  async listar(
    @Query() filtros: FiltrosListarDespesasDto,
  ): Promise<RespostaPaginada<DespesaRespostaDto>> {
    return this.despesasService.listar(filtros);
  }

  @Get(':id')
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Busca despesa por ID' })
  @ApiOkResponse({ type: DespesaRespostaDto })
  @ApiNotFoundResponse({ description: 'Despesa não encontrada' })
  async buscarPorId(@Param('id') id: string): Promise<DespesaRespostaDto> {
    return this.despesasService.buscarPorId(id);
  }

  @Post()
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Cadastra nova despesa (multa / abastecimento / manutenção)' })
  @ApiCreatedResponse({ type: DespesaRespostaDto })
  @ApiBadRequestResponse({ description: 'Campos específicos do tipo faltando' })
  async criar(@Body() dto: CriarDespesaDto): Promise<DespesaRespostaDto> {
    return this.despesasService.criar(dto);
  }

  @Put(':id')
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Atualiza despesa' })
  @ApiOkResponse({ type: DespesaRespostaDto })
  @ApiNotFoundResponse({ description: 'Despesa não encontrada' })
  async atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarDespesaDto,
  ): Promise<DespesaRespostaDto> {
    return this.despesasService.atualizar(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove despesa (soft delete)' })
  @ApiNotFoundResponse({ description: 'Despesa não encontrada' })
  async excluir(@Param('id') id: string): Promise<void> {
    return this.despesasService.excluir(id);
  }
}
