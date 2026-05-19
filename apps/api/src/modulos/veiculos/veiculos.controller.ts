import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { RespostaPaginada, UsuarioJwt } from '@fleetops/types';
import { VeiculosService } from './veiculos.service';
import { CriarVeiculoDto } from './dto/criar-veiculo.dto';
import { AtualizarVeiculoDto } from './dto/atualizar-veiculo.dto';
import { VeiculoRespostaDto } from './dto/veiculo-resposta.dto';
import { FiltrosListarVeiculosDto } from './dto/filtros-listar-veiculos.dto';
import { CriarAbastecimentoDto } from './dto/criar-abastecimento.dto';
import { AbastecimentoRespostaDto } from './dto/abastecimento-resposta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioAutenticado } from '../../common/decorators/usuario-autenticado.decorator';

@ApiTags('Veículos')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('veiculos')
export class VeiculosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Get()
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Lista veículos com filtros e paginação' })
  @ApiOkResponse({ description: 'Lista paginada de veículos' })
  async listar(
    @Query() filtros: FiltrosListarVeiculosDto,
  ): Promise<RespostaPaginada<VeiculoRespostaDto>> {
    return this.veiculosService.listar(filtros);
  }

  @Get('meus')
  @Roles('motorista')
  @ApiOperation({ summary: 'Veículos das viagens do motorista logado' })
  @ApiOkResponse({ type: [VeiculoRespostaDto] })
  async meusVeiculos(
    @UsuarioAutenticado() usuario: UsuarioJwt,
  ): Promise<VeiculoRespostaDto[]> {
    return this.veiculosService.listarDoMotorista(usuario.sub);
  }

  @Get(':id')
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Busca veículo por ID' })
  @ApiOkResponse({ type: VeiculoRespostaDto })
  @ApiNotFoundResponse({ description: 'Veículo não encontrado' })
  async buscarPorId(@Param('id') id: string): Promise<VeiculoRespostaDto> {
    return this.veiculosService.buscarPorId(id);
  }

  @Post()
  @Roles('admin', 'operador')
  @ApiOperation({ summary: 'Cadastra novo veículo' })
  @ApiCreatedResponse({ type: VeiculoRespostaDto })
  @ApiConflictResponse({ description: 'Placa ou RENAVAM já cadastrado' })
  @ApiForbiddenResponse({ description: 'Apenas admin e operador' })
  async criar(@Body() dto: CriarVeiculoDto): Promise<VeiculoRespostaDto> {
    return this.veiculosService.criar(dto);
  }

  @Put(':id')
  @Roles('admin', 'operador')
  @ApiOperation({ summary: 'Atualiza dados do veículo' })
  @ApiOkResponse({ type: VeiculoRespostaDto })
  @ApiNotFoundResponse({ description: 'Veículo não encontrado' })
  async atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarVeiculoDto,
  ): Promise<VeiculoRespostaDto> {
    return this.veiculosService.atualizar(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'operador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui veículo logicamente (soft delete)' })
  @ApiNotFoundResponse({ description: 'Veículo não encontrado' })
  @ApiConflictResponse({ description: 'Veículo com viagem ativa não pode ser excluído' })
  async excluir(@Param('id') id: string): Promise<void> {
    return this.veiculosService.excluir(id);
  }

  @Post(':id/despesas')
  @Roles('motorista')
  @ApiOperation({
    summary: 'Motorista lança abastecimento em veículo que ele dirige',
  })
  @ApiCreatedResponse({ type: AbastecimentoRespostaDto })
  @ApiForbiddenResponse({ description: 'Motorista sem viagem com este veículo' })
  @ApiNotFoundResponse({ description: 'Veículo não encontrado' })
  async criarAbastecimento(
    @Param('id') id: string,
    @Body() dto: CriarAbastecimentoDto,
    @UsuarioAutenticado() usuario: UsuarioJwt,
  ): Promise<AbastecimentoRespostaDto> {
    return this.veiculosService.criarAbastecimentoMotorista(id, dto, usuario);
  }
}
