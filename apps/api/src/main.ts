import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TodasExcecoesFilter } from './common/filters/todas-excecoes.filter';
import { registrarLoggerHttp } from './common/hooks/registrar-logger-http';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
  );

  // Compressão HTTP — brotli/gzip nas respostas > 1 KB. Reduz payload de
  // listagens (/viagens, /relatorios) em ~70%.
  await app.register(compress, {
    global: true,
    threshold: 1024,
    encodings: ['br', 'gzip', 'deflate'],
  });

  // Helmet — headers de segurança (PRD §8.3). Mantemos CSP desligado por padrão
  // pois o Swagger UI carrega assets inline; CORS já é tratado abaixo.
  await app.register(helmet, { contentSecurityPolicy: false });

  // Hook de monitoria HTTP (todas as requisições)
  registrarLoggerHttp(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new TodasExcecoesFilter());

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('FleetOps API')
    .setDescription('API do Sistema de Gestão de Frota Corporativa')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // API_PORT (local) → PORT (Railway/Render/Fly injetam PORT) → 3001
  const portaEnv = process.env.API_PORT ?? process.env.PORT;
  const porta = portaEnv ? parseInt(portaEnv, 10) : 3001;
  await app.listen(porta, '0.0.0.0');

  logger.log(`FleetOps API rodando em http://localhost:${porta}`);
  logger.log(`Swagger disponível em http://localhost:${porta}/docs`);
}

bootstrap();
