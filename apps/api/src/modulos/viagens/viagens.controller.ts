import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
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
  ApiConflictResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { RespostaPaginada, UsuarioJwt } from '@fleetops/types';
import { ViagensService } from './viagens.service';
import { CriarViagemDto } from './dto/criar-viagem.dto';
import { AtualizarViagemDto } from './dto/atualizar-viagem.dto';
import { IniciarViagemDto } from './dto/iniciar-viagem.dto';
import { FinalizarViagemDto } from './dto/finalizar-viagem.dto';
import { ViagemRespostaDto } from './dto/viagem-resposta.dto';
import { FiltrosListarViagensDto } from './dto/filtros-listar-viagens.dto';
import { CriarPosicaoDto, PosicaoRespostaDto } from './dto/criar-posicao.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioAutenticado } from '../../common/decorators/usuario-autenticado.decorator';

@ApiTags('Viagens')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('viagens')
export class ViagensController {
  constructor(private readonly viagensService: ViagensService) {}

  @Get()
  @Roles('admin', 'operador', 'gerente', 'encarregado', 'motorista')
  @ApiOperation({ summary: 'Lista viagens (motorista vê apenas as próprias)' })
  @ApiOkResponse({ description: 'Lista paginada de viagens' })
  async listar(
    @Query() filtros: FiltrosListarViagensDto,
    @UsuarioAutenticado() usuario: UsuarioJwt,
  ): Promise<RespostaPaginada<ViagemRespostaDto>> {
    return this.viagensService.listar(filtros, usuario);
  }

  @Get(':id')
  @Roles('admin', 'operador', 'gerente', 'encarregado', 'motorista')
  @ApiOperation({ summary: 'Retorna detalhes de uma viagem' })
  @ApiOkResponse({ type: ViagemRespostaDto })
  @ApiNotFoundResponse({ description: 'Viagem não encontrada' })
  async buscarPorId(
    @Param('id') id: string,
    @UsuarioAutenticado() usuario: UsuarioJwt,
  ): Promise<ViagemRespostaDto> {
    return this.viagensService.buscarPorId(id, usuario);
  }

  @Post()
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Cria nova viagem' })
  @ApiCreatedResponse({ type: ViagemRespostaDto })
  @ApiConflictResponse({ description: 'Motorista ou veículo com viagem ativa na data' })
  @ApiBadRequestResponse({ description: 'CNH vencida, horários inválidos ou campo faltando' })
  async criar(
    @Body() dto: CriarViagemDto,
    @UsuarioAutenticado() usuario: UsuarioJwt,
  ): Promise<ViagemRespostaDto> {
    return this.viagensService.criar(dto, usuario.sub);
  }

  @Put(':id')
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Atualiza dados de uma viagem (apenas status CRIADA)' })
  @ApiOkResponse({ type: ViagemRespostaDto })
  @ApiNotFoundResponse({ description: 'Viagem não encontrada' })
  @ApiBadRequestResponse({ description: 'Viagem não está no status CRIADA ou dados inválidos' })
  async atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarViagemDto,
  ): Promise<ViagemRespostaDto> {
    return this.viagensService.atualizar(id, dto);
  }

  @Patch(':id/iniciar')
  @Roles('admin', 'operador', 'gerente', 'encarregado', 'motorista')
  @ApiOperation({ summary: 'Inicia uma viagem (status: CRIADA → EM_ANDAMENTO)' })
  @ApiOkResponse({ type: ViagemRespostaDto })
  @ApiBadRequestResponse({ description: 'Status inválido ou odômetro menor que o atual' })
  async iniciar(
    @Param('id') id: string,
    @Body() dto: IniciarViagemDto,
    @UsuarioAutenticado() usuario: UsuarioJwt,
  ): Promise<ViagemRespostaDto> {
    return this.viagensService.iniciar(id, dto, usuario);
  }

  @Patch(':id/finalizar')
  @Roles('admin', 'operador', 'gerente', 'encarregado', 'motorista')
  @ApiOperation({ summary: 'Finaliza uma viagem (status: EM_ANDAMENTO → FINALIZADA)' })
  @ApiOkResponse({ type: ViagemRespostaDto })
  @ApiBadRequestResponse({ description: 'Status inválido ou odômetro final menor que o inicial' })
  async finalizar(
    @Param('id') id: string,
    @Body() dto: FinalizarViagemDto,
    @UsuarioAutenticado() usuario: UsuarioJwt,
  ): Promise<ViagemRespostaDto> {
    return this.viagensService.finalizar(id, dto, usuario);
  }

  @Post(':id/posicoes')
  @Roles('motorista')
  @ApiOperation({
    summary: 'Reporta posição GPS atual (apenas motorista, viagem EM_ANDAMENTO)',
    description: 'O app mobile envia 1 ponto a cada 3 min durante a viagem.',
  })
  @ApiCreatedResponse({ type: PosicaoRespostaDto })
  @ApiBadRequestResponse({ description: 'Viagem não está EM_ANDAMENTO' })
  async registrarPosicao(
    @Param('id') id: string,
    @Body() dto: CriarPosicaoDto,
    @UsuarioAutenticado() usuario: UsuarioJwt,
  ): Promise<PosicaoRespostaDto> {
    return this.viagensService.registrarPosicao(id, usuario, dto);
  }

  @Get(':id/posicoes')
  @Roles('admin', 'operador', 'gerente', 'encarregado', 'motorista')
  @ApiOperation({ summary: 'Últimas posições GPS registradas na viagem (desc)' })
  @ApiOkResponse({ type: [PosicaoRespostaDto] })
  async listarPosicoes(
    @Param('id') id: string,
    @UsuarioAutenticado() usuario: UsuarioJwt,
    @Query('limite') limite?: string,
  ): Promise<PosicaoRespostaDto[]> {
    return this.viagensService.listarPosicoes(id, usuario, limite ? parseInt(limite, 10) : 50);
  }
}
