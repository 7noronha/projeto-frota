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
import type { RespostaPaginada, UsuarioJwt } from '@fleetops/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioAutenticado } from '../../common/decorators/usuario-autenticado.decorator';
import { ImpostosService } from './impostos.service';
import { CriarImpostoDto } from './dto/criar-imposto.dto';
import { AtualizarImpostoDto } from './dto/atualizar-imposto.dto';
import { ImpostoRespostaDto } from './dto/imposto-resposta.dto';
import { ImpostoHistoricoRespostaDto } from './dto/imposto-historico-resposta.dto';
import { FiltrosListarImpostosDto } from './dto/filtros-listar-impostos.dto';

@ApiTags('Impostos')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('impostos')
export class ImpostosController {
  constructor(private readonly service: ImpostosService) {}

  @Get()
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Lista impostos' })
  @ApiOkResponse()
  async listar(
    @Query() filtros: FiltrosListarImpostosDto,
  ): Promise<RespostaPaginada<ImpostoRespostaDto>> {
    return this.service.listar(filtros);
  }

  @Get(':id')
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Busca imposto por ID' })
  @ApiOkResponse({ type: ImpostoRespostaDto })
  @ApiNotFoundResponse()
  async buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<ImpostoRespostaDto> {
    return this.service.buscarPorId(id);
  }

  @Get(':id/historicos')
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Lista alterações auditadas do imposto' })
  @ApiOkResponse({ type: [ImpostoHistoricoRespostaDto] })
  async historicos(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ImpostoHistoricoRespostaDto[]> {
    return this.service.listarHistoricos(id);
  }

  @Post()
  @Roles('admin', 'operador')
  @ApiOperation({ summary: 'Cria imposto' })
  @ApiCreatedResponse({ type: ImpostoRespostaDto })
  async criar(@Body() dto: CriarImpostoDto): Promise<ImpostoRespostaDto> {
    return this.service.criar(dto);
  }

  @Patch(':id')
  @Roles('admin', 'operador')
  @ApiOperation({ summary: 'Atualiza imposto (gera histórico)' })
  @ApiOkResponse({ type: ImpostoRespostaDto })
  @ApiNotFoundResponse()
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarImpostoDto,
    @UsuarioAutenticado() usuario: UsuarioJwt,
  ): Promise<ImpostoRespostaDto> {
    return this.service.atualizar(id, dto, usuario.sub);
  }

  @Delete(':id')
  @Roles('admin', 'operador')
  @HttpCode(204)
  @ApiOperation({ summary: 'Exclui imposto (soft delete)' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  async excluir(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.excluir(id);
  }
}
