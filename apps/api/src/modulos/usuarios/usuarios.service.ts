import { calcularPaginacao } from '../../common/utils/paginacao';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { agoraBrasilia, formatarDataHoraBrasilia } from '@fleetops/utils/datetime';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { UsuarioRespostaDto } from './dto/usuario-resposta.dto';
import { FiltrosListarUsuariosDto } from './dto/filtros-listar-usuarios.dto';
import type { RespostaPaginada } from '@fleetops/types';

const BCRYPT_SALT_ROUNDS = 10;

type UsuarioComPerfil = {
  id: number;
  matricula: string;
  nome: string;
  perfil_id: number;
  perfil: { id: number; nome: string; descricao: string | null };
  email: string | null;
  telefone: string | null;
  cnh: string | null;
  cnh_validade: Date | null;
  ativo: boolean;
  data_hora_criacao: Date;
};

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FiltrosListarUsuariosDto): Promise<RespostaPaginada<UsuarioRespostaDto>> {
    const { pagina, tamanhoPagina, skip } = calcularPaginacao(filtros);

    const limiteCnh =
      filtros.cnhVencendoAteDias !== undefined
        ? (() => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() + filtros.cnhVencendoAteDias);
            return d;
          })()
        : undefined;

    const where = {
      data_hora_exclusao: null as null,
      ...(filtros.perfil_id && { perfil_id: filtros.perfil_id }),
      ...(filtros.matricula && { matricula: { contains: filtros.matricula } }),
      ...(filtros.nome && { nome: { contains: filtros.nome, mode: 'insensitive' as const } }),
      ...(filtros.ativo !== undefined && { ativo: filtros.ativo }),
      ...(limiteCnh && { cnh_validade: { not: null, lte: limiteCnh } }),
    };

    const [total, usuarios] = await Promise.all([
      this.prisma.usuarios.count({ where }),
      this.prisma.usuarios.findMany({
        where,
        skip,
        take: tamanhoPagina,
        orderBy: { data_hora_criacao: 'desc' },
        include: { perfil: true },
      }),
    ]);

    return {
      dados: usuarios.map((u) => this.mapearResposta(u)),
      total,
      pagina,
      tamanho_pagina: tamanhoPagina,
      total_paginas: Math.ceil(total / tamanhoPagina),
    };
  }

  async buscarPorId(id: number): Promise<UsuarioRespostaDto> {
    const usuario = await this.prisma.usuarios.findFirst({
      where: { id, data_hora_exclusao: null },
      include: { perfil: true },
    });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return this.mapearResposta(usuario);
  }

  async criar(dto: CriarUsuarioDto): Promise<UsuarioRespostaDto> {
    const perfil = await this.prisma.perfis_usuario.findUnique({ where: { id: dto.perfil_id } });
    if (!perfil) throw new BadRequestException('Perfil inválido');

    if (perfil.nome === 'motorista' && (!dto.cnh || !dto.cnh_validade)) {
      throw new BadRequestException('CNH e validade da CNH são obrigatórios para motoristas');
    }

    const existente = await this.prisma.usuarios.findFirst({
      where: { matricula: dto.matricula, data_hora_exclusao: null },
    });
    if (existente) throw new ConflictException('Matrícula já está em uso');

    const senhaHash = await bcrypt.hash(dto.senha, BCRYPT_SALT_ROUNDS);

    const usuario = await this.prisma.usuarios.create({
      data: {
        matricula: dto.matricula,
        nome: dto.nome,
        senha_hash: senhaHash,
        perfil_id: dto.perfil_id,
        email: dto.email ?? null,
        telefone: dto.telefone ?? null,
        cnh: dto.cnh ?? null,
        cnh_validade: dto.cnh_validade ? new Date(dto.cnh_validade) : null,
        ativo: dto.ativo ?? true,
      },
      include: { perfil: true },
    });

    return this.mapearResposta(usuario);
  }

  async atualizar(id: number, dto: AtualizarUsuarioDto): Promise<UsuarioRespostaDto> {
    const usuario = await this.prisma.usuarios.findFirst({
      where: { id, data_hora_exclusao: null },
      include: { perfil: true },
    });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');

    // Validar perfil novo, se mudou
    let perfilNovo = usuario.perfil;
    if (dto.perfil_id && dto.perfil_id !== usuario.perfil_id) {
      const p = await this.prisma.perfis_usuario.findUnique({ where: { id: dto.perfil_id } });
      if (!p) throw new BadRequestException('Perfil inválido');
      perfilNovo = p;
    }

    if (perfilNovo.nome === 'motorista') {
      const cnhFinal = dto.cnh ?? usuario.cnh;
      const cnhValidadeFinal = dto.cnh_validade ?? usuario.cnh_validade;
      if (!cnhFinal || !cnhValidadeFinal) {
        throw new BadRequestException('CNH e validade da CNH são obrigatórios para motoristas');
      }
    }

    const senhaHash = dto.senha ? await bcrypt.hash(dto.senha, BCRYPT_SALT_ROUNDS) : undefined;

    const atualizado = await this.prisma.usuarios.update({
      where: { id },
      data: {
        ...(dto.nome && { nome: dto.nome }),
        ...(senhaHash && { senha_hash: senhaHash }),
        ...(dto.perfil_id && { perfil_id: dto.perfil_id }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.telefone !== undefined && { telefone: dto.telefone }),
        ...(dto.cnh !== undefined && { cnh: dto.cnh }),
        ...(dto.cnh_validade !== undefined && {
          cnh_validade: dto.cnh_validade ? new Date(dto.cnh_validade) : null,
        }),
        ...(dto.ativo !== undefined && { ativo: dto.ativo }),
      },
      include: { perfil: true },
    });

    return this.mapearResposta(atualizado);
  }

  async inativar(id: number): Promise<void> {
    const usuario = await this.prisma.usuarios.findFirst({
      where: { id, data_hora_exclusao: null },
    });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    await this.prisma.usuarios.update({ where: { id }, data: { ativo: false } });
  }

  async excluir(id: number): Promise<void> {
    const usuario = await this.prisma.usuarios.findFirst({
      where: { id, data_hora_exclusao: null },
    });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    await this.prisma.usuarios.update({
      where: { id },
      data: { data_hora_exclusao: agoraBrasilia() },
    });
  }

  async registrarPushToken(usuarioId: number, token: string | null | undefined): Promise<void> {
    const valorFinal = token && token.trim() !== '' ? token.trim() : null;
    await this.prisma.usuarios.update({
      where: { id: usuarioId },
      data: { expo_push_token: valorFinal },
    });
  }

  private mapearResposta(u: UsuarioComPerfil): UsuarioRespostaDto {
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
      data_hora_criacao: formatarDataHoraBrasilia(u.data_hora_criacao),
    };
  }
}
