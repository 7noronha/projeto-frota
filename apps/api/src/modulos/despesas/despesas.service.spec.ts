import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { DespesasService } from './despesas.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CriarDespesaDto,
  TipoDespesaEnum,
  TipoCombustivelEnum,
  TipoManutencaoEnum,
  GravidadeMultaEnum,
  TipoImpostoEnum,
  CoberturaSeguroEnum,
  TipoDocumentoEnum,
} from './dto/criar-despesa.dto';

const mockVeiculoPrisma = {
  id: 'uuid-veiculo-1',
  placa: 'ABC1D23',
};

function mockDespesaPrisma(overrides: Record<string, unknown> = {}) {
  return {
    id: 'uuid-despesa-1',
    veiculoId: 'uuid-veiculo-1',
    tipo: 'abastecimento',
    data: new Date('2026-05-10'),
    valor: new Decimal('270.50'),
    descricao: 'ABASTECIMENTO POSTO IPIRANGA',
    observacoes: null,
    odometro: 15800,
    litros: new Decimal('45.123'),
    precoLitro: new Decimal('5.999'),
    tipoCombustivel: 'gasolina',
    tipoManutencao: null,
    oficina: null,
    numeroAuto: null,
    gravidade: null,
    pontosCnh: null,
    dataVencimento: null,
    tipoImposto: null,
    anoExercicio: null,
    numeroParcela: null,
    totalParcelas: null,
    seguradora: null,
    numeroApolice: null,
    vigenciaInicio: null,
    vigenciaFim: null,
    coberturaTipo: null,
    tipoDocumento: null,
    dataCriacao: new Date('2026-05-10T08:00:00'),
    ...overrides,
  };
}

function dtoAbastecimento(over: Partial<CriarDespesaDto> = {}): CriarDespesaDto {
  return {
    veiculoId: 'uuid-veiculo-1',
    tipo: TipoDespesaEnum.ABASTECIMENTO,
    data: '2026-05-10',
    valor: 270.5,
    descricao: 'ABASTECIMENTO POSTO IPIRANGA',
    odometro: 15800,
    litros: 45.123,
    precoLitro: 5.999,
    tipoCombustivel: TipoCombustivelEnum.GASOLINA,
    ...over,
  };
}

describe('DespesasService', () => {
  let service: DespesasService;
  let prisma: {
    veiculo: { findFirst: jest.Mock };
    despesaVeiculo: {
      count: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      veiculo: { findFirst: jest.fn().mockResolvedValue(mockVeiculoPrisma) },
      despesaVeiculo: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        create: jest.fn().mockResolvedValue(mockDespesaPrisma()),
        update: jest.fn().mockResolvedValue(mockDespesaPrisma()),
      },
    };
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [DespesasService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = modulo.get<DespesasService>(DespesasService);
  });

  describe('listar', () => {
    it('deve aplicar filtros de veiculo, tipo e periodo', async () => {
      prisma.despesaVeiculo.count.mockResolvedValue(2);
      prisma.despesaVeiculo.findMany.mockResolvedValue([
        mockDespesaPrisma(),
        mockDespesaPrisma({ id: 'uuid-despesa-2' }),
      ]);

      const resp = await service.listar({
        pagina: 1,
        tamanhoPagina: 20,
        veiculoId: 'uuid-veiculo-1',
        tipo: TipoDespesaEnum.ABASTECIMENTO,
        dataInicio: '2026-05-01',
        dataFim: '2026-05-31',
      });

      expect(resp.total).toBe(2);
      expect(resp.dados).toHaveLength(2);
      expect(prisma.despesaVeiculo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            veiculoId: 'uuid-veiculo-1',
            tipo: 'abastecimento',
            data: { gte: new Date('2026-05-01'), lte: new Date('2026-05-31') },
          }),
        }),
      );
    });

    it('deve listar sem filtros', async () => {
      const resp = await service.listar({ pagina: 1, tamanhoPagina: 20 });
      expect(resp.total).toBe(0);
      expect(resp.dados).toEqual([]);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar a despesa', async () => {
      prisma.despesaVeiculo.findFirst.mockResolvedValue(mockDespesaPrisma());
      const d = await service.buscarPorId('uuid-despesa-1');
      expect(d.id).toBe('uuid-despesa-1');
      expect(d.valor).toBe(270.5);
    });

    it('deve lancar NotFound quando nao existir', async () => {
      prisma.despesaVeiculo.findFirst.mockResolvedValue(null);
      await expect(service.buscarPorId('nao-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('criar', () => {
    it('deve criar abastecimento com todos os campos especificos', async () => {
      const dto = dtoAbastecimento();
      const r = await service.criar(dto);

      expect(prisma.veiculo.findFirst).toHaveBeenCalled();
      expect(prisma.despesaVeiculo.create).toHaveBeenCalled();
      expect(r.tipoCombustivel).toBe('gasolina');
      expect(r.litros).toBe(45.123);
    });

    it('deve lancar NotFound quando veiculo nao existir', async () => {
      prisma.veiculo.findFirst.mockResolvedValue(null);
      await expect(service.criar(dtoAbastecimento())).rejects.toThrow(NotFoundException);
    });

    it('deve exigir litros/precoLitro/tipoCombustivel em abastecimento', async () => {
      await expect(
        service.criar(dtoAbastecimento({ litros: undefined })),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.criar(dtoAbastecimento({ precoLitro: undefined })),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.criar(dtoAbastecimento({ tipoCombustivel: undefined })),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve exigir tipoManutencao em manutencao', async () => {
      const dto: CriarDespesaDto = {
        veiculoId: 'uuid-veiculo-1',
        tipo: TipoDespesaEnum.MANUTENCAO,
        data: '2026-05-10',
        valor: 800,
        descricao: 'TROCA DE OLEO',
      };
      await expect(service.criar(dto)).rejects.toThrow(/manutenção/i);
      await expect(
        service.criar({ ...dto, tipoManutencao: TipoManutencaoEnum.PREVENTIVA }),
      ).resolves.toBeDefined();
    });

    it('deve exigir gravidade em multa', async () => {
      const dto: CriarDespesaDto = {
        veiculoId: 'uuid-veiculo-1',
        tipo: TipoDespesaEnum.MULTA,
        data: '2026-05-10',
        valor: 130,
        descricao: 'EXCESSO DE VELOCIDADE',
      };
      await expect(service.criar(dto)).rejects.toThrow(/gravidade/i);
      await expect(
        service.criar({ ...dto, gravidade: GravidadeMultaEnum.MEDIA }),
      ).resolves.toBeDefined();
    });

    it('deve exigir tipoImposto e anoExercicio em imposto', async () => {
      const base: CriarDespesaDto = {
        veiculoId: 'uuid-veiculo-1',
        tipo: TipoDespesaEnum.IMPOSTO,
        data: '2026-01-10',
        valor: 1200,
        descricao: 'IPVA 2026',
      };
      await expect(service.criar(base)).rejects.toThrow(BadRequestException);
      await expect(
        service.criar({ ...base, tipoImposto: TipoImpostoEnum.IPVA, anoExercicio: 2026 }),
      ).resolves.toBeDefined();
    });

    it('deve rejeitar parcelas inconsistentes em imposto', async () => {
      const base: CriarDespesaDto = {
        veiculoId: 'uuid-veiculo-1',
        tipo: TipoDespesaEnum.IMPOSTO,
        data: '2026-01-10',
        valor: 400,
        descricao: 'IPVA 2026 PARCELA',
        tipoImposto: TipoImpostoEnum.IPVA,
        anoExercicio: 2026,
        numeroParcela: 4,
        totalParcelas: 3,
      };
      await expect(service.criar(base)).rejects.toThrow(/parcela/i);
    });

    it('deve exigir seguradora/vigencia/cobertura em seguro e validar vigencia final > inicial', async () => {
      const base: CriarDespesaDto = {
        veiculoId: 'uuid-veiculo-1',
        tipo: TipoDespesaEnum.SEGURO,
        data: '2026-01-01',
        valor: 3500,
        descricao: 'SEGURO ANUAL',
      };
      await expect(service.criar(base)).rejects.toThrow(BadRequestException);
      await expect(
        service.criar({
          ...base,
          seguradora: 'PORTO SEGURO',
          vigenciaInicio: '2026-06-01',
          vigenciaFim: '2026-01-01',
          coberturaTipo: CoberturaSeguroEnum.TOTAL,
        }),
      ).rejects.toThrow(/vigência final/i);
    });

    it('deve exigir tipoDocumento em documentacao', async () => {
      const dto: CriarDespesaDto = {
        veiculoId: 'uuid-veiculo-1',
        tipo: TipoDespesaEnum.DOCUMENTACAO,
        data: '2026-04-10',
        valor: 150,
        descricao: 'CRLV 2026',
      };
      await expect(service.criar(dto)).rejects.toThrow(/documenta/i);
      await expect(
        service.criar({ ...dto, tipoDocumento: TipoDocumentoEnum.CRLV }),
      ).resolves.toBeDefined();
    });
  });

  describe('atualizar', () => {
    it('deve atualizar valor e descricao', async () => {
      prisma.despesaVeiculo.findFirst.mockResolvedValue(mockDespesaPrisma());
      prisma.despesaVeiculo.update.mockResolvedValue(
        mockDespesaPrisma({ valor: new Decimal('300.00'), descricao: 'NOVA DESCRICAO' }),
      );

      const r = await service.atualizar('uuid-despesa-1', { valor: 300, descricao: 'NOVA DESCRICAO' });
      expect(r.valor).toBe(300);
      expect(r.descricao).toBe('NOVA DESCRICAO');
    });

    it('deve lancar NotFound se despesa nao existir', async () => {
      prisma.despesaVeiculo.findFirst.mockResolvedValue(null);
      await expect(service.atualizar('x', { valor: 1 })).rejects.toThrow(NotFoundException);
    });

    it('deve revalidar campos especificos quando tipo muda', async () => {
      prisma.despesaVeiculo.findFirst.mockResolvedValue(mockDespesaPrisma());
      await expect(
        service.atualizar('uuid-despesa-1', { tipo: TipoDespesaEnum.MULTA }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('excluir', () => {
    it('deve marcar dataExclusao', async () => {
      prisma.despesaVeiculo.findFirst.mockResolvedValue(mockDespesaPrisma());
      await service.excluir('uuid-despesa-1');
      expect(prisma.despesaVeiculo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'uuid-despesa-1' },
          data: expect.objectContaining({ dataExclusao: expect.any(Date) }),
        }),
      );
    });

    it('deve lancar NotFound se nao existir', async () => {
      prisma.despesaVeiculo.findFirst.mockResolvedValue(null);
      await expect(service.excluir('x')).rejects.toThrow(NotFoundException);
    });
  });
});
