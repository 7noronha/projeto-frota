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
  ApiTags,
} from '@nestjs/swagger';
import { RespostaPaginada } from '@fleetops/types';
import { DocumentacoesService } from './documentacoes.service';
import { CriarDocumentacaoDto } from './dto/criar-documentacao.dto';
import { AtualizarDocumentacaoDto } from './dto/atualizar-documentacao.dto';
import { DocumentacaoRespostaDto } from './dto/documentacao-resposta.dto';
import { FiltrosListarDocumentacoesDto } from './dto/filtros-listar-documentacoes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Documentações')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documentacoes')
export class DocumentacoesController {
  constructor(private readonly service: DocumentacoesService) {}

  @Get()
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  async listar(
    @Query() filtros: FiltrosListarDocumentacoesDto,
  ): Promise<RespostaPaginada<DocumentacaoRespostaDto>> {
    return this.service.listar(filtros);
  }

  @Get(':id')
  @Roles('admin', 'operador', 'gerente', 'encarregado')
  @ApiOkResponse({ type: DocumentacaoRespostaDto })
  @ApiNotFoundResponse()
  async buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<DocumentacaoRespostaDto> {
    return this.service.buscarPorId(id);
  }

  @Post()
  @Roles('admin', 'operador')
  @ApiCreatedResponse({ type: DocumentacaoRespostaDto })
  @ApiBadRequestResponse()
  async criar(@Body() dto: CriarDocumentacaoDto): Promise<DocumentacaoRespostaDto> {
    return this.service.criar(dto);
  }

  @Put(':id')
  @Roles('admin', 'operador')
  @ApiOkResponse({ type: DocumentacaoRespostaDto })
  @ApiNotFoundResponse()
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarDocumentacaoDto,
  ): Promise<DocumentacaoRespostaDto> {
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
