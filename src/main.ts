// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';
// import { ResponseInterceptor } from './common/interceptors/response.interceptor';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,              // loại bỏ field thừa
//       forbidNonWhitelisted: true,   // báo lỗi nếu có field thừa
//       transform: true,              // tự động convert type (string → number, v.v...)
//       transformOptions: { enableImplicitConversion: true },
//     }),
//   );
//   // format output
//   app.useGlobalInterceptors(new ResponseInterceptor());

//   await app.listen(process.env.PORT ?? 3000);
// }
// bootstrap();


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: "http://localhost:3000",
    credentials: true,
  });

  app.useGlobalInterceptors(new ResponseInterceptor());

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);

  console.log(`Server running on http://localhost:${port}`);
}
bootstrap();
