import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modulos/auth/auth.module';
import { UsuariosModule } from './modulos/usuarios/usuarios.module';
import { VeiculosModule } from './modulos/veiculos/veiculos.module';
import { ViagensModule } from './modulos/viagens/viagens.module';

@Module({
  imports: [PrismaModule, AuthModule, UsuariosModule, VeiculosModule, ViagensModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
