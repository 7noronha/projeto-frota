import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Perfil, UsuarioJwt } from '@fleetops/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RespostaLoginDto } from './dto/resposta-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<RespostaLoginDto> {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        matricula: dto.matricula,
        dataExclusao: null,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Matrícula ou senha incorretos');
    }

    if (!usuario.ativo) {
      throw new UnauthorizedException('Usuário inativo. Contate o administrador');
    }

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException('Matrícula ou senha incorretos');
    }

    const payload: Omit<UsuarioJwt, 'iat' | 'exp'> = {
      sub: usuario.id,
      matricula: usuario.matricula,
      nome: usuario.nome,
      perfil: usuario.perfil as Perfil,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      usuario: {
        id: usuario.id,
        matricula: usuario.matricula,
        nome: usuario.nome,
        perfil: usuario.perfil as Perfil,
      },
    };
  }

  async perfil(usuarioJwt: UsuarioJwt): Promise<UsuarioJwt> {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id: usuarioJwt.sub, dataExclusao: null },
    });

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo');
    }

    return usuarioJwt;
  }
}
