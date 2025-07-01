import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{ cors: true });
    // Aumentar el límite del body
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

   const config = new DocumentBuilder()
    .setTitle('Mi API')
    .setDescription('Documentación de ejemplo con Swagger')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('user')
    .addTag('roles')    
    .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api', app, document,{
      explorer:true,
    });
    
  await app.listen(process.env.PORT || 3000);
  
}
bootstrap();
