import { Module } from '@nestjs/common';
import { SegurosController } from './seguros.controller';
import { SegurosService } from './seguros.service';

@Module({
  controllers: [SegurosController],
  providers: [SegurosService],
})
export class SegurosModule {}
