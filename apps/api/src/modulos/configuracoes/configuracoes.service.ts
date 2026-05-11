import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AtualizarConfiguracaoDto } from './dto/atualizar-configuracao.dto';
import { ConfiguracaoRespostaDto } from './dto/configuracao-resposta.dto';

@Injectable()
export class ConfiguracoesService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<ConfiguracaoRespostaDto[]> {
    const config = await this.prisma.configuracao.findMany({
      orderBy: { chave: 'asc' },
    });
    return config.map((c) => ({
      chave: c.chave,
      valor: c.valor,
      dataAtualizacao: c.dataAtualizacao,
    }));
  }

  async buscarPorChave(chave: string): Promise<ConfiguracaoRespostaDto> {
    const config = await this.prisma.configuracao.findFirst({ where: { chave } });
    if (!config) {
      throw new NotFoundException(`Configuração '${chave}' não encontrada`);
    }
    return { chave: config.chave, valor: config.valor, dataAtualizacao: config.dataAtualizacao };
  }

  async atualizar(
    chave: string,
    dto: AtualizarConfiguracaoDto,
  ): Promise<ConfiguracaoRespostaDto> {
    const existente = await this.prisma.configuracao.findFirst({ where: { chave } });
    if (!existente) {
      throw new NotFoundException(`Configuração '${chave}' não encontrada`);
    }
    const atualizada = await this.prisma.configuracao.update({
      where: { chave },
      data: { valor: dto.valor },
    });
    return {
      chave: atualizada.chave,
      valor: atualizada.valor,
      dataAtualizacao: atualizada.dataAtualizacao,
    };
  }
}
