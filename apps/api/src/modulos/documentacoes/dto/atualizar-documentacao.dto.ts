import { OmitType, PartialType } from '@nestjs/swagger';
import { CriarDocumentacaoDto } from './criar-documentacao.dto';

export class AtualizarDocumentacaoDto extends PartialType(
  OmitType(CriarDocumentacaoDto, ['veiculo_id'] as const),
) {}
