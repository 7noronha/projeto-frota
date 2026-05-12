import { PartialType } from '@nestjs/swagger';
import { CriarDespesaDto } from './criar-despesa.dto';

export class AtualizarDespesaDto extends PartialType(CriarDespesaDto) {}
