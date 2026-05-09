import { calcularPaginacao } from '../../common/utils/paginacao';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Perfil } from '@fleetops/types';
import { agoraBrasilia, formatarDataHoraBrasilia } from '@fleetops/utils/datetime';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { UsuarioRespostaDto } from './dto/usuario-resposta.dto';
import { FiltrosListarUsuariosDto } from './dto/filtros-listar-usuarios.dto';
import type { RespostaPaginada } from '@fleetops/types';

type UsuarioPrisma = {
  id: string;
  matricula: string;
  nome: string;
  perfil: string;
  email: string | null;
  telefone: string | null;
  cnh: string | null;
  cnhValidade: Date | null;
  ativo: boolean;
  dataCriacao: Date;
};

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FiltrosListarUsuariosDto): Promise<RespostaPaginada<UsuarioRespostaDto>> {
    const { pagina, tamanhoPagina, skip } = calcularPaginacao(filtros);

    const where = {
      dataExclusao: null as null,
      ...(filtros.perfil && { perfil: filtros.perfil }),
      ...(filtros.matricula && { matricula: { contains: filtros.matricula } }),
      ...(filtros.nome && { nome: { contains: filtros.nome, mode: 'insensitive' as const } }),
      ...(filtros.ativo !== undefined && { ativo: filtros.ativo }),
    };

    const [total, usuarios] = await Promise.all([
      this.prisma.usuario.count({ where }),
      this.prisma.usuario.findMany({
        where,
        skip,
        take: tamanhoPagina,
        orderBy: { dataCriacao: 'desc' },
        select: {
          id: true,
          matricula: true,
          nome: true,
          perfil: true,
          email: true,
          telefone: true,
          cnh: true,
          cnhValidade: true,
          ativo: true,
          dataCriacao: true,
        },
      }),
    ]);

    return {
      dados: usuarios.map((u) => this.mapearResposta(u)),
      total,
      pagina,
      tamanhoPagina,
      totalPaginas: Math.ceil(total / tamanhoPagina),
    };
  }

  async buscarPorId(id: string): Promise<UsuarioRespostaDto> {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id, dataExclusao: null },
      select: {
        id: true,
        matricula: true,
        nome: true,
        perfil: true,
        email: true,
        telefone: true,
        cnh: true,
        cnhValidade: true,
        ativo: true,
        dataCriacao: true,
      },
    });

    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return this.mapearResposta(usuario);
  }

  async criar(dto: CriarUsuarioDto): Promise<UsuarioRespostaDto> {
    if (dto.perfil === 'motorista' && (!dto.cnh || !dto.cnhValidade)) {
      throw new BadRequestException('CNH e validade da CNH são obrigatórios para motoristas');
    }

    const existente = await this.prisma.usuario.findFirst({
      where: { matricula: dto.matricula, dataExclusao: null },
    });
    if (existente) throw new ConflictException('Matrícula já está em uso');

    const senhaHash = await bcrypt.hash(dto.senha, BCRYPT_SALT_ROUNDS);

    const usuario = await this.prisma.usuario.create({
      data: {
        matricula: dto.matricula,
        nome: dto.nome,
        senhaHash,
        perfil: dto.perfil,
        email: dto.email ?? null,
        telefone: dto.telefone ?? null,
        cnh: dto.cnh ?? null,
        cnhValidade: dto.cnhValidade ? new Date(dto.cnhValidade) : null,
        ativo: dto.ativo ?? true,
      },
      select: {
        id: true,
        matricula: true,
        nome: true,
        perfil: true,
        email: true,
        telefone: true,
        cnh: true,
        cnhValidade: true,
        ativo: true,
        dataCriacao: true,
      },
    });

    return this.mapearResposta(usuario);
  }

  async atualizar(id: string, dto: AtualizarUsuarioDto): Promise<UsuarioRespostaDto> {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id, dataExclusao: null },
    });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');

    if (dto.perfil === 'motorista') {
      const cnhFinal = dto.cnh ?? usuario.cnh;
      const cnhValidadeFinal = dto.cnhValidade ?? usuario.cnhValidade;
      if (!cnhFinal || !cnhValidadeFinal) {
        throw new BadRequestException('CNH e validade da CNH são obrigatórios para motoristas');
      }
    }

    const senhaHash = dto.senha ? await bcrypt.hash(dto.senha, BCRYPT_SALT_ROUNDS) : undefined;

    const atualizado = await this.prisma.usuario.update({
      where: { id },
      data: {
        ...(dto.nome && { nome: dto.nome }),
        ...(senhaHash && { senhaHash }),
        ...(dto.perfil && { perfil: dto.perfil }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.telefone !== undefined && { telefone: dto.telefone }),
        ...(dto.cnh !== undefined && { cnh: dto.cnh }),
        ...(dto.cnhValidade !== undefined && {
          cnhValidade: dto.cnhValidade ? new Date(dto.cnhValidade) : null,
        }),
        ...(dto.ativo !== undefined && { ativo: dto.ativo }),
      },
      select: {
        id: true,
        matricula: true,
        nome: true,
        perfil: true,
        email: true,
        telefone: true,
        cnh: true,
        cnhValidade: true,
        ativo: true,
        dataCriacao: true,
      },
    });

    return this.mapearResposta(atualizado);
  }

  async inativar(id: string): Promise<void> {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id, dataExclusao: null },
    });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');

    await this.prisma.usuario.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async excluir(id: string): Promise<void> {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id, dataExclusao: null },
    });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');

    await this.prisma.usuario.update({
      where: { id },
      data: { dataExclusao: agoraBrasilia() },
    });
  }

  private mapearResposta(usuario: UsuarioPrisma): UsuarioRespostaDto {
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
      dataCriacao: formatarDataHoraBrasilia(usuario.dataCriacao),
    };
  }
}
