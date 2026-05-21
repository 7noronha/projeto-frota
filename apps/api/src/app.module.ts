import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modulos/auth/auth.module';
import { UsuariosModule } from './modulos/usuarios/usuarios.module';
import { VeiculosModule } from './modulos/veiculos/veiculos.module';
import { ViagensModule } from './modulos/viagens/viagens.module';
import { ConfiguracoesModule } from './modulos/configuracoes/configuracoes.module';
import { RelatoriosModule } from './modulos/relatorios/relatorios.module';
import { AlertasModule } from './modulos/alertas/alertas.module';
import { DespesasModule } from './modulos/despesas/despesas.module';
import { NotificacoesModule } from './common/notificacoes/notificacoes.module';

@Module({
  imports: [
    // Rate limiting global — 60 req/min por IP em qualquer rota
    // Rotas sensíveis (login) sobrescrevem com @Throttle
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000, // 1 minuto
        limit: 60,
      },
    ]),
    PrismaModule,
    NotificacoesModule,
    AuthModule,
    UsuariosModule,
    VeiculosModule,
    ViagensModule,
    ConfiguracoesModule,
    RelatoriosModule,
    AlertasModule,
    DespesasModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
