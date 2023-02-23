import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
const fs = require('fs');
const cors = require('cors')
async function bootstrap() {

const httpsOptions = {
  key: fs.readFileSync('C:\\Users\\MSI\\key.pem'),
  cert: fs.readFileSync('C:\\Users\\MSI\\server.crt'),
};
const app = await NestFactory.create(AppModule, {
 // httpsOptions,
});

app.enableCors();



app.use(compression(  {
  
  threshold: 0}));

    app.useGlobalPipes(new ValidationPipe({
    whitelist: true // to remove additional properties in body 
  }))

  
  await app.listen(3002);


}
bootstrap();
