import { Module } from '@nestjs/common';
import { ViagensService } from './viagens.service';
import { ViagensController } from './viagens.controller';
import { GeocodingService } from '../../common/geocoding/geocoding.service';
import { DirectionsService } from '../../common/geocoding/directions.service';
import { VelocidadeService } from '../relatorios/velocidade.service';

@Module({
  controllers: [ViagensController],
  providers: [ViagensService, GeocodingService, DirectionsService, VelocidadeService],
  exports: [ViagensService],
})
export class ViagensModule {}
