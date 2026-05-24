import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AtualizarConfiguracaoDto } from './dto/atualizar-configuracao.dto';
import { ConfiguracaoRespostaDto } from './dto/configuracao-resposta.dto';

@Injectable()
export class ConfiguracoesService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<ConfiguracaoRespostaDto[]> {
    const config = await this.prisma.configuracoes.findMany({
      orderBy: { chave: 'asc' },
    });
    return config.map((c) => ({
      chave: c.chave,
      valor: c.valor,
      data_hora_atualizacao: c.data_hora_atualizacao,
    }));
  }

  async buscarPorChave(chave: string): Promise<ConfiguracaoRespostaDto> {
    const config = await this.prisma.configuracoes.findFirst({ where: { chave } });
    if (!config) {
      throw new NotFoundException(`Configuração '${chave}' não encontrada`);
    }
    return {
      chave: config.chave,
      valor: config.valor,
      data_hora_atualizacao: config.data_hora_atualizacao,
    };
  }

  async atualizar(
    chave: string,
    dto: AtualizarConfiguracaoDto,
  ): Promise<ConfiguracaoRespostaDto> {
    const existente = await this.prisma.configuracoes.findFirst({ where: { chave } });
    if (!existente) {
      throw new NotFoundException(`Configuração '${chave}' não encontrada`);
    }
    const atualizada = await this.prisma.configuracoes.update({
      where: { chave },
      data: { valor: dto.valor },
    });
    return {
      chave: atualizada.chave,
      valor: atualizada.valor,
      data_hora_atualizacao: atualizada.data_hora_atualizacao,
    };
  }
}
