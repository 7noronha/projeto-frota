import { PartialType } from '@nestjs/swagger';
import { CriarViagemDto } from './criar-viagem.dto';

/**
 * Todos os campos opcionais — operador pode atualizar qualquer subset.
 * Só pode ser usado em viagens com status CRIADA.
 */
export class AtualizarViagemDto extends PartialType(CriarViagemDto) {}
