import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiTooManyRequestsResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UsuarioJwt, UsuarioResposta } from '@fleetops/types';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RespostaLoginDto } from './dto/resposta-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsuarioAutenticado } from '../../common/decorators/usuario-autenticado.decorator';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  // Rate limit específico do login: 5 tentativas por minuto por IP — proteção anti brute-force
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Realiza login com matrícula e senha' })
  @ApiOkResponse({ type: RespostaLoginDto, description: 'Login realizado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Matrícula ou senha incorretos' })
  @ApiTooManyRequestsResponse({ description: 'Muitas tentativas de login. Aguarde 1 minuto.' })
  async login(@Body() dto: LoginDto): Promise<RespostaLoginDto> {
    return this.authService.login(dto);
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Retorna os dados do JWT do usuário autenticado' })
  @ApiOkResponse({ description: 'Dados do perfil autenticado' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou expirado' })
  async perfil(@UsuarioAutenticado() usuario: UsuarioJwt): Promise<UsuarioJwt> {
    return this.authService.perfil(usuario);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Retorna dados completos do usuário autenticado (com CNH, telefone, etc)' })
  @ApiOkResponse({ description: 'UsuarioResposta completo' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou expirado' })
  async meusDados(@UsuarioAutenticado() usuario: UsuarioJwt): Promise<UsuarioResposta> {
    return this.authService.meusDados(usuario);
  }
}
