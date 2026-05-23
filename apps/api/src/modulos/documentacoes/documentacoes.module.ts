import { Module } from '@nestjs/common';
import { DocumentacoesController } from './documentacoes.controller';
import { DocumentacoesService } from './documentacoes.service';

@Module({
  controllers: [DocumentacoesController],
  providers: [DocumentacoesService],
})
export class DocumentacoesModule {}
