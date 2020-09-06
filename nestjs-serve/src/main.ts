import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path'

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // 设置静态资源允许访问
  app.useStaticAssets(join(__dirname, '../public', '/'), {
    prefix: '/',
  });
  console.log("Serve is OK:   http://127.0.0.1:3000",)
  await app.listen(3000);
}
bootstrap();
