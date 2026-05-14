import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Maiusculas } from '../../../common/decorators/maiusculas.decorator';

export enum TipoDespesaEnum {
  MULTA = 'multa',
  ABASTECIMENTO = 'abastecimento',
  MANUTENCAO = 'manutencao',
  IMPOSTO = 'imposto',
  SEGURO = 'seguro',
  DOCUMENTACAO = 'documentacao',
}

export enum TipoCombustivelEnum {
  GASOLINA = 'gasolina',
  ETANOL = 'etanol',
  DIESEL = 'diesel',
  GNV = 'gnv',
  FLEX = 'flex',
}

export enum TipoManutencaoEnum {
  PREVENTIVA = 'preventiva',
  CORRETIVA = 'corretiva',
}

export enum GravidadeMultaEnum {
  LEVE = 'leve',
  MEDIA = 'media',
  GRAVE = 'grave',
  GRAVISSIMA = 'gravissima',
}

export enum TipoImpostoEnum {
  IPVA = 'ipva',
  LICENCIAMENTO = 'licenciamento',
  DPVAT = 'dpvat',
  OUTRO = 'outro',
}

export enum CoberturaSeguroEnum {
  TOTAL = 'total',
  TERCEIROS = 'terceiros',
  COMPREENSIVA = 'compreensiva',
}

export enum TipoDocumentoEnum {
  CRLV = 'crlv',
  TRANSFERENCIA = 'transferencia',
  VISTORIA = 'vistoria',
  EMPLACAMENTO = 'emplacamento',
  OUTRO = 'outro',
}

export class CriarDespesaDto {
  @ApiProperty({ example: 'uuid-veiculo' })
  @IsUUID('4', { message: 'veiculoId inválido' })
  veiculoId: string;

  @ApiProperty({ enum: TipoDespesaEnum })
  @IsEnum(TipoDespesaEnum, { message: 'Tipo de despesa inválido' })
  tipo: TipoDespesaEnum;

  @ApiProperty({ example: '2026-05-12', description: 'Data da despesa (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Data inválida' })
  data: string;

  @ApiProperty({ example: 350.5, description: 'Valor em R$' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor deve ser um número com até 2 decimais' })
  @Min(0.01, { message: 'Valor deve ser maior que zero' })
  valor: number;

  @ApiProperty({ example: 'ABASTECIMENTO POSTO IPIRANGA' })
  @Maiusculas()
  @IsString()
  @MinLength(1, { message: 'Descrição é obrigatória' })
  @MaxLength(500, { message: 'Descrição deve ter no máximo 500 caracteres' })
  descricao: string;

  @ApiPropertyOptional({ example: 'TANQUE COMPLETO' })
  @Maiusculas()
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiPropertyOptional({ example: 15800, description: 'Leitura do odômetro' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Odômetro não pode ser negativo' })
  odometro?: number;

  // ─── Específicos de ABASTECIMENTO ─────────────────────────────────────────
  @ApiPropertyOptional({ example: 45.123 })
  @ValidateIf((o: CriarDespesaDto) => o.tipo === TipoDespesaEnum.ABASTECIMENTO)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001, { message: 'Litros deve ser maior que zero' })
  litros?: number;

  @ApiPropertyOptional({ example: 5.999 })
  @ValidateIf((o: CriarDespesaDto) => o.tipo === TipoDespesaEnum.ABASTECIMENTO)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001, { message: 'Preço por litro deve ser maior que zero' })
  precoLitro?: number;

  @ApiPropertyOptional({ enum: TipoCombustivelEnum })
  @ValidateIf((o: CriarDespesaDto) => o.tipo === TipoDespesaEnum.ABASTECIMENTO)
  @IsEnum(TipoCombustivelEnum, { message: 'Tipo de combustível inválido' })
  tipoCombustivel?: TipoCombustivelEnum;

  // ─── Específicos de MANUTENÇÃO ────────────────────────────────────────────
  @ApiPropertyOptional({ enum: TipoManutencaoEnum })
  @ValidateIf((o: CriarDespesaDto) => o.tipo === TipoDespesaEnum.MANUTENCAO)
  @IsEnum(TipoManutencaoEnum, { message: 'Tipo de manutenção inválido' })
  tipoManutencao?: TipoManutencaoEnum;

  @ApiPropertyOptional({ example: 'OFICINA CENTRAL — BRASÍLIA' })
  @Maiusculas()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  oficina?: string;

  // ─── Específicos de MULTA ─────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 'AB-1234567', description: 'Número do auto de infração' })
  @Maiusculas()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroAuto?: string;

  @ApiPropertyOptional({ enum: GravidadeMultaEnum })
  @ValidateIf((o: CriarDespesaDto) => o.tipo === TipoDespesaEnum.MULTA)
  @IsEnum(GravidadeMultaEnum, { message: 'Gravidade inválida' })
  gravidade?: GravidadeMultaEnum;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pontosCnh?: number;

  @ApiPropertyOptional({ example: '2026-06-15' })
  @IsOptional()
  @IsDateString({}, { message: 'Data de vencimento inválida' })
  dataVencimento?: string;

  // ─── Específicos de IMPOSTO ───────────────────────────────────────────────
  @ApiPropertyOptional({ enum: TipoImpostoEnum })
  @ValidateIf((o: CriarDespesaDto) => o.tipo === TipoDespesaEnum.IMPOSTO)
  @IsEnum(TipoImpostoEnum, { message: 'Tipo de imposto inválido' })
  tipoImposto?: TipoImpostoEnum;

  @ApiPropertyOptional({ example: 2026 })
  @ValidateIf((o: CriarDespesaDto) => o.tipo === TipoDespesaEnum.IMPOSTO)
  @Type(() => Number)
  @IsInt()
  @Min(2000, { message: 'Ano de exercício mínimo: 2000' })
  anoExercicio?: number;

  @ApiPropertyOptional({ example: 1, description: 'Número da parcela atual' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numeroParcela?: number;

  @ApiPropertyOptional({ example: 3, description: 'Total de parcelas' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalParcelas?: number;

  // ─── Específicos de SEGURO ────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 'PORTO SEGURO' })
  @ValidateIf((o: CriarDespesaDto) => o.tipo === TipoDespesaEnum.SEGURO)
  @Maiusculas()
  @IsString()
  @MinLength(1, { message: 'Seguradora é obrigatória' })
  @MaxLength(200)
  seguradora?: string;

  @ApiPropertyOptional({ example: '12345678-9' })
  @IsOptional()
  @Maiusculas()
  @IsString()
  @MaxLength(100)
  numeroApolice?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @ValidateIf((o: CriarDespesaDto) => o.tipo === TipoDespesaEnum.SEGURO)
  @IsDateString({}, { message: 'Data de início da vigência inválida' })
  vigenciaInicio?: string;

  @ApiPropertyOptional({ example: '2027-01-01' })
  @ValidateIf((o: CriarDespesaDto) => o.tipo === TipoDespesaEnum.SEGURO)
  @IsDateString({}, { message: 'Data de fim da vigência inválida' })
  vigenciaFim?: string;

  @ApiPropertyOptional({ enum: CoberturaSeguroEnum })
  @ValidateIf((o: CriarDespesaDto) => o.tipo === TipoDespesaEnum.SEGURO)
  @IsEnum(CoberturaSeguroEnum, { message: 'Tipo de cobertura inválido' })
  coberturaTipo?: CoberturaSeguroEnum;

  // ─── Específicos de DOCUMENTAÇÃO ──────────────────────────────────────────
  @ApiPropertyOptional({ enum: TipoDocumentoEnum })
  @ValidateIf((o: CriarDespesaDto) => o.tipo === TipoDespesaEnum.DOCUMENTACAO)
  @IsEnum(TipoDocumentoEnum, { message: 'Tipo de documento inválido' })
  tipoDocumento?: TipoDocumentoEnum;
}
