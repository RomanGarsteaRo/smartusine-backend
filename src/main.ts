/* main.ts */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({
        transform: true,              // transformă tipurile (ex. string -> number)
        whitelist: true,              // elimină câmpuri care nu sunt în DTO
        forbidNonWhitelisted: false,  // poți pune true dacă vrei să dea eroare la extra fields
    }));

    app.useWebSocketAdapter(new WsAdapter(app)); // protocol WS simplu (nu Socket.IO)

    /* TODO CORS în NestJS (dev vs prod)?*/
    app.enableCors({
        origin: 'http://localhost:4200',
        credentials: false,
    });

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
