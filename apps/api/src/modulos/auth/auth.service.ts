import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Perfil, UsuarioJwt, UsuarioResposta } from '@fleetops/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RespostaLoginDto } from './dto/resposta-login.dto';
import { AtualizarPerfilDto } from './dto/atualizar-perfil.dto';

const BCRYPT_SALT_ROUNDS = 10;

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

  /**
   * Retorna dados completos do usuário autenticado, incluindo CNH e
   * validade. Usado pelo mobile para mostrar avisos contextuais
   * (ex: banner de CNH vencendo).
   */
  async meusDados(usuarioJwt: UsuarioJwt): Promise<UsuarioResposta> {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id: usuarioJwt.sub, dataExclusao: null },
    });

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo');
    }

    return {
      id: usuario.id,
      matricula: usuario.matricula,
      nome: usuario.nome,
      perfil: usuario.perfil as Perfil,
      email: usuario.email,
      telefone: usuario.telefone,
      cnh: usuario.cnh,
      cnhValidade: usuario.cnhValidade
        ? usuario.cnhValidade.toISOString().split('T')[0]
        : null,
      ativo: usuario.ativo,
      dataCriacao: usuario.dataCriacao.toISOString(),
    };
  }

  /**
   * Permite ao usuário autenticado atualizar seu próprio perfil
   * (telefone, e-mail e senha). NÃO permite mudar matrícula, nome,
   * perfil ou status — esses só via admin (PUT /usuarios/:id).
   *
   * Trocar senha exige confirmar a senha atual.
   */
  async atualizarMeuPerfil(
    usuarioJwt: UsuarioJwt,
    dto: AtualizarPerfilDto,
  ): Promise<UsuarioResposta> {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id: usuarioJwt.sub, dataExclusao: null },
    });

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo');
    }

    // Trocar senha exige senha atual válida
    let novoHash: string | undefined;
    if (dto.novaSenha) {
      if (!dto.senhaAtual) {
        throw new BadRequestException('Informe a senha atual para alterar a senha');
      }
      const senhaConfere = await bcrypt.compare(dto.senhaAtual, usuario.senhaHash);
      if (!senhaConfere) {
        throw new BadRequestException('Senha atual incorreta');
      }
      novoHash = await bcrypt.hash(dto.novaSenha, BCRYPT_SALT_ROUNDS);
    }

    const atualizado = await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        ...(dto.email !== undefined && { email: dto.email || null }),
        ...(dto.telefone !== undefined && { telefone: dto.telefone || null }),
        ...(novoHash && { senhaHash: novoHash }),
      },
    });

    return {
      id: atualizado.id,
      matricula: atualizado.matricula,
      nome: atualizado.nome,
      perfil: atualizado.perfil as Perfil,
      email: atualizado.email,
      telefone: atualizado.telefone,
      cnh: atualizado.cnh,
      cnhValidade: atualizado.cnhValidade
        ? atualizado.cnhValidade.toISOString().split('T')[0]
        : null,
      ativo: atualizado.ativo,
      dataCriacao: atualizado.dataCriacao.toISOString(),
    };
  }
}
