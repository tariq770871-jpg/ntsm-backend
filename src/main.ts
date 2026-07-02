import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(compression());

  // CORS: allow all origins in non-production, restrict in production
  const allowedOrigins = process.env.ALLOWED_ORIGINS;
  if (allowedOrigins && allowedOrigins.trim() !== '') {
    const origins = allowedOrigins.split(',').map(o => o.trim()).filter(Boolean);
    app.enableCors({
      origin: origins,
      credentials: true,
    });
  } else {
    app.enableCors({
      origin: true,
      credentials: true,
    });
  }

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('NOC System API')
    .setDescription('Network Operations Center API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();
