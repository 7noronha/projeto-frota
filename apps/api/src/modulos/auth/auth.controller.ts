import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsuarioJwt } from '@fleetops/types';
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
  @ApiOperation({ summary: 'Realiza login com matrícula e senha' })
  @ApiOkResponse({ type: RespostaLoginDto, description: 'Login realizado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Matrícula ou senha incorretos' })
  async login(@Body() dto: LoginDto): Promise<RespostaLoginDto> {
    return this.authService.login(dto);
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado' })
  @ApiOkResponse({ description: 'Dados do perfil autenticado' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou expirado' })
  async perfil(@UsuarioAutenticado() usuario: UsuarioJwt): Promise<UsuarioJwt> {
    return this.authService.perfil(usuario);
  }
}
