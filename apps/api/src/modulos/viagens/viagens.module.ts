import { Module } from '@nestjs/common';
import { ViagensService } from './viagens.service';
import { ViagensController } from './viagens.controller';
import { GeocodingService } from '../../common/geocoding/geocoding.service';

@Module({
  controllers: [ViagensController],
  providers: [ViagensService, GeocodingService],
  exports: [ViagensService],
})
export class ViagensModule {}
