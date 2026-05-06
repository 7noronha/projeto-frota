import { Module } from '@nestjs/common';
import { ViagensService } from './viagens.service';
import { ViagensController } from './viagens.controller';

@Module({
  controllers: [ViagensController],
  providers: [ViagensService],
  exports: [ViagensService],
})
export class ViagensModule {}
