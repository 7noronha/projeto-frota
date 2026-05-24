import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { RespostaPaginada } from '@fleetops/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MultasService } from './multas.service';
import { CriarMultaDto } from './dto/criar-multa.dto';
import { AtualizarMultaDto } from './dto/atualizar-multa.dto';
import { MultaRespostaDto } from './dto/multa-resposta.dto';
import { FiltrosListarMultasDto } from './dto/filtros-listar-multas.dto';

@ApiTags('Multas')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('multas')
export class MultasController {
  constructor(private readonly service: MultasService) {}

  @Get()
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Lista multas' })
  @ApiOkResponse({ description: 'Lista paginada' })
  async listar(
    @Query() filtros: FiltrosListarMultasDto,
  ): Promise<RespostaPaginada<MultaRespostaDto>> {
    return this.service.listar(filtros);
  }

  @Get(':id')
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Busca multa por ID' })
  @ApiOkResponse({ type: MultaRespostaDto })
  @ApiNotFoundResponse()
  async buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<MultaRespostaDto> {
    return this.service.buscarPorId(id);
  }

  @Post()
  @Roles('admin', 'operador')
  @ApiOperation({ summary: 'Cria multa' })
  @ApiCreatedResponse({ type: MultaRespostaDto })
  async criar(@Body() dto: CriarMultaDto): Promise<MultaRespostaDto> {
    return this.service.criar(dto);
  }

  @Patch(':id')
  @Roles('admin', 'operador')
  @ApiOperation({ summary: 'Atualiza multa' })
  @ApiOkResponse({ type: MultaRespostaDto })
  @ApiNotFoundResponse()
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarMultaDto,
  ): Promise<MultaRespostaDto> {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'operador')
  @HttpCode(204)
  @ApiOperation({ summary: 'Exclui multa (soft delete)' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  async excluir(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.excluir(id);
  }
}
