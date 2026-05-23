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
import { SegurosService } from './seguros.service';
import { CriarSeguroDto } from './dto/criar-seguro.dto';
import { AtualizarSeguroDto } from './dto/atualizar-seguro.dto';
import { SeguroRespostaDto } from './dto/seguro-resposta.dto';
import { FiltrosListarSegurosDto } from './dto/filtros-listar-seguros.dto';

@ApiTags('Seguros')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('seguros')
export class SegurosController {
  constructor(private readonly service: SegurosService) {}

  @Get()
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Lista seguros' })
  @ApiOkResponse()
  async listar(
    @Query() filtros: FiltrosListarSegurosDto,
  ): Promise<RespostaPaginada<SeguroRespostaDto>> {
    return this.service.listar(filtros);
  }

  @Get(':id')
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Busca seguro por ID' })
  @ApiOkResponse({ type: SeguroRespostaDto })
  @ApiNotFoundResponse()
  async buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<SeguroRespostaDto> {
    return this.service.buscarPorId(id);
  }

  @Post()
  @Roles('admin', 'operador')
  @ApiOperation({ summary: 'Cria seguro' })
  @ApiCreatedResponse({ type: SeguroRespostaDto })
  async criar(@Body() dto: CriarSeguroDto): Promise<SeguroRespostaDto> {
    return this.service.criar(dto);
  }

  @Patch(':id')
  @Roles('admin', 'operador')
  @ApiOperation({ summary: 'Atualiza seguro' })
  @ApiOkResponse({ type: SeguroRespostaDto })
  @ApiNotFoundResponse()
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarSeguroDto,
  ): Promise<SeguroRespostaDto> {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'operador')
  @HttpCode(204)
  @ApiOperation({ summary: 'Exclui seguro (soft delete)' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  async excluir(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.excluir(id);
  }
}
