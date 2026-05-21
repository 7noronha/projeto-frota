import { Module } from '@nestjs/common';
import { ViagensService } from './viagens.service';
import { ViagensController } from './viagens.controller';
import { GeocodingService } from '../../common/geocoding/geocoding.service';
import { DirectionsService } from '../../common/geocoding/directions.service';

@Module({
  controllers: [ViagensController],
  providers: [ViagensService, GeocodingService, DirectionsService],
  exports: [ViagensService],
})
export class ViagensModule {}
