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
import { UsuariosService } from './usuarios.service';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { UsuarioRespostaDto } from './dto/usuario-resposta.dto';
import { FiltrosListarUsuariosDto } from './dto/filtros-listar-usuarios.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { RespostaPaginada } from '@fleetops/types';

@ApiTags('Usuários')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Lista usuários com filtros e paginação' })
  @ApiOkResponse({ description: 'Lista paginada de usuários' })
  @ApiForbiddenResponse({ description: 'Apenas administradores' })
  async listar(
    @Query() filtros: FiltrosListarUsuariosDto,
  ): Promise<RespostaPaginada<UsuarioRespostaDto>> {
    return this.usuariosService.listar(filtros);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Busca usuário por ID' })
  @ApiOkResponse({ type: UsuarioRespostaDto })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  async buscarPorId(@Param('id') id: string): Promise<UsuarioRespostaDto> {
    return this.usuariosService.buscarPorId(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Cadastra novo usuário' })
  @ApiCreatedResponse({ type: UsuarioRespostaDto })
  @ApiConflictResponse({ description: 'Matrícula já está em uso' })
  async criar(@Body() dto: CriarUsuarioDto): Promise<UsuarioRespostaDto> {
    return this.usuariosService.criar(dto);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza dados do usuário' })
  @ApiOkResponse({ type: UsuarioRespostaDto })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  async atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarUsuarioDto,
  ): Promise<UsuarioRespostaDto> {
    return this.usuariosService.atualizar(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Inativa usuário (exclusão lógica)' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  async inativar(@Param('id') id: string): Promise<void> {
    return this.usuariosService.inativar(id);
  }
}
