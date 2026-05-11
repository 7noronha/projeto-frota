import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { ConfiguracoesService } from './configuracoes.service';
import { AtualizarConfiguracaoDto } from './dto/atualizar-configuracao.dto';
import { ConfiguracaoRespostaDto } from './dto/configuracao-resposta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Configurações')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('configuracoes')
export class ConfiguracoesController {
  constructor(private readonly configuracoesService: ConfiguracoesService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Lista todas as configurações do sistema' })
  @ApiOkResponse({ type: [ConfiguracaoRespostaDto] })
  @ApiForbiddenResponse({ description: 'Apenas administradores' })
  async listar(): Promise<ConfiguracaoRespostaDto[]> {
    return this.configuracoesService.listar();
  }

  @Get(':chave')
  @Roles('admin')
  @ApiOperation({ summary: 'Busca configuração pela chave' })
  @ApiOkResponse({ type: ConfiguracaoRespostaDto })
  @ApiNotFoundResponse({ description: 'Configuração não encontrada' })
  async buscarPorChave(@Param('chave') chave: string): Promise<ConfiguracaoRespostaDto> {
    return this.configuracoesService.buscarPorChave(chave);
  }

  @Put(':chave')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza o valor de uma configuração' })
  @ApiOkResponse({ type: ConfiguracaoRespostaDto })
  @ApiNotFoundResponse({ description: 'Configuração não encontrada' })
  async atualizar(
    @Param('chave') chave: string,
    @Body() dto: AtualizarConfiguracaoDto,
  ): Promise<ConfiguracaoRespostaDto> {
    return this.configuracoesService.atualizar(chave, dto);
  }
}
