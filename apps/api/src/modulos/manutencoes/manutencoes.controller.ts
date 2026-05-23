import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RespostaPaginada } from '@fleetops/types';
import { ManutencoesService } from './manutencoes.service';
import { CriarManutencaoDto } from './dto/criar-manutencao.dto';
import { AtualizarManutencaoDto } from './dto/atualizar-manutencao.dto';
import { ManutencaoRespostaDto } from './dto/manutencao-resposta.dto';
import { FiltrosListarManutencoesDto } from './dto/filtros-listar-manutencoes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Manutenções')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('manutencoes')
export class ManutencoesController {
  constructor(private readonly service: ManutencoesService) {}

  @Get()
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Lista manutenções com filtros e paginação' })
  @ApiOkResponse({ description: 'Lista paginada' })
  async listar(
    @Query() filtros: FiltrosListarManutencoesDto,
  ): Promise<RespostaPaginada<ManutencaoRespostaDto>> {
    return this.service.listar(filtros);
  }

  @Get(':id')
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOkResponse({ type: ManutencaoRespostaDto })
  @ApiNotFoundResponse()
  async buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<ManutencaoRespostaDto> {
    return this.service.buscarPorId(id);
  }

  @Post()
  @Roles('admin', 'operador')
  @ApiOperation({ summary: 'Cadastra nova manutenção' })
  @ApiCreatedResponse({ type: ManutencaoRespostaDto })
  @ApiBadRequestResponse({ description: 'FK inválida ou dados incorretos' })
  async criar(@Body() dto: CriarManutencaoDto): Promise<ManutencaoRespostaDto> {
    return this.service.criar(dto);
  }

  @Put(':id')
  @Roles('admin', 'operador')
  @ApiOkResponse({ type: ManutencaoRespostaDto })
  @ApiNotFoundResponse()
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarManutencaoDto,
  ): Promise<ManutencaoRespostaDto> {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'operador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui logicamente (soft delete via data_hora_exclusao)' })
  @ApiNotFoundResponse()
  async excluir(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.excluir(id);
  }
}
