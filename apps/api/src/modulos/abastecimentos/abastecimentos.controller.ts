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
import { AbastecimentosService } from './abastecimentos.service';
import { CriarAbastecimentoDto } from './dto/criar-abastecimento.dto';
import { AtualizarAbastecimentoDto } from './dto/atualizar-abastecimento.dto';
import { AbastecimentoRespostaDto } from './dto/abastecimento-resposta.dto';
import { FiltrosListarAbastecimentosDto } from './dto/filtros-listar-abastecimentos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Abastecimentos')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('abastecimentos')
export class AbastecimentosController {
  constructor(private readonly service: AbastecimentosService) {}

  @Get()
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOperation({ summary: 'Lista abastecimentos com filtros e paginação' })
  async listar(
    @Query() filtros: FiltrosListarAbastecimentosDto,
  ): Promise<RespostaPaginada<AbastecimentoRespostaDto>> {
    return this.service.listar(filtros);
  }

  @Get(':id')
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOkResponse({ type: AbastecimentoRespostaDto })
  @ApiNotFoundResponse()
  async buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<AbastecimentoRespostaDto> {
    return this.service.buscarPorId(id);
  }

  @Post()
  @Roles('admin', 'operador')
  @ApiCreatedResponse({ type: AbastecimentoRespostaDto })
  @ApiBadRequestResponse()
  async criar(@Body() dto: CriarAbastecimentoDto): Promise<AbastecimentoRespostaDto> {
    return this.service.criar(dto);
  }

  @Put(':id')
  @Roles('admin', 'operador')
  @ApiOkResponse({ type: AbastecimentoRespostaDto })
  @ApiNotFoundResponse()
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarAbastecimentoDto,
  ): Promise<AbastecimentoRespostaDto> {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'operador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNotFoundResponse()
  async excluir(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.excluir(id);
  }
}
