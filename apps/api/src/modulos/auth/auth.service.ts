import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioJwt, UsuarioResposta } from '@fleetops/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RespostaLoginDto } from './dto/resposta-login.dto';
import { AtualizarPerfilDto } from './dto/atualizar-perfil.dto';

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Inclui a relação `perfil` para resposta. Outras leituras seguem o mesmo
 * padrão pra evitar N+1 quando o nome do perfil é exibido.
 */
const INCLUDE_PERFIL = { perfil: true } as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<RespostaLoginDto> {
    const usuario = await this.prisma.usuarios.findFirst({
      where: { matricula: dto.matricula, data_hora_exclusao: null },
      include: INCLUDE_PERFIL,
    });

    if (!usuario) {
      throw new UnauthorizedException('Matrícula ou senha incorretos');
    }
    if (!usuario.ativo) {
      throw new UnauthorizedException('Usuário inativo. Contate o administrador');
    }

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senha_hash);
    if (!senhaValida) {
      throw new UnauthorizedException('Matrícula ou senha incorretos');
    }

    const payload: Omit<UsuarioJwt, 'iat' | 'exp'> = {
      sub: usuario.id,
      matricula: usuario.matricula,
      nome: usuario.nome,
      perfil: usuario.perfil.nome,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      usuario: {
        id: usuario.id,
        matricula: usuario.matricula,
        nome: usuario.nome,
        perfil: usuario.perfil.nome,
      },
    };
  }

  async perfil(usuarioJwt: UsuarioJwt): Promise<UsuarioJwt> {
    const usuario = await this.prisma.usuarios.findFirst({
      where: { id: usuarioJwt.sub, data_hora_exclusao: null },
    });
    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo');
    }
    return usuarioJwt;
  }

  async meusDados(usuarioJwt: UsuarioJwt): Promise<UsuarioResposta> {
    const usuario = await this.prisma.usuarios.findFirst({
      where: { id: usuarioJwt.sub, data_hora_exclusao: null },
      include: INCLUDE_PERFIL,
    });
    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo');
    }
    return this.mapearResposta(usuario);
  }

  async atualizarMeuPerfil(
    usuarioJwt: UsuarioJwt,
    dto: AtualizarPerfilDto,
  ): Promise<UsuarioResposta> {
    const usuario = await this.prisma.usuarios.findFirst({
      where: { id: usuarioJwt.sub, data_hora_exclusao: null },
      include: INCLUDE_PERFIL,
    });
    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo');
    }

    let novoHash: string | undefined;
    if (dto.novaSenha) {
      if (!dto.senhaAtual) {
        throw new BadRequestException('Informe a senha atual para alterar a senha');
      }
      const senhaConfere = await bcrypt.compare(dto.senhaAtual, usuario.senha_hash);
      if (!senhaConfere) {
        throw new BadRequestException('Senha atual incorreta');
      }
      novoHash = await bcrypt.hash(dto.novaSenha, BCRYPT_SALT_ROUNDS);
    }

    const atualizado = await this.prisma.usuarios.update({
      where: { id: usuario.id },
      data: {
        ...(dto.email !== undefined && { email: dto.email || null }),
        ...(dto.telefone !== undefined && { telefone: dto.telefone || null }),
        ...(novoHash && { senha_hash: novoHash }),
      },
      include: INCLUDE_PERFIL,
    });

    return this.mapearResposta(atualizado);
  }

  private mapearResposta(
    u: { id: number; matricula: string; nome: string; perfil_id: number; perfil: { id: number; nome: string; descricao: string | null };
        email: string | null; telefone: string | null; cnh: string | null;
        cnh_validade: Date | null; ativo: boolean; data_hora_criacao: Date },
  ): UsuarioResposta {
    return {
      id: u.id,
      matricula: u.matricula,
      nome: u.nome,
      perfil_id: u.perfil_id,
      perfil: { id: u.perfil.id, nome: u.perfil.nome, descricao: u.perfil.descricao },
      email: u.email,
      telefone: u.telefone,
      cnh: u.cnh,
      cnh_validade: u.cnh_validade ? u.cnh_validade.toISOString().split('T')[0] ?? null : null,
      ativo: u.ativo,
      data_hora_criacao: u.data_hora_criacao.toISOString(),
    };
  }
}
