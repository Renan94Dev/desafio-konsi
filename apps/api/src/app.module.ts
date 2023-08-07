import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrawlerModule } from './crawler/crawler.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { RedisModule } from './redis/redis.module';
import { StaticModule } from './serve-static/serve-static.module';
import { ElasticSearchModule } from './elasticsearch/elasticsearch.module';
import { StartupService } from './startup.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/api/.env',
    }),
    StaticModule,
    EventEmitterModule.forRoot(),
    RabbitMQModule,
    CrawlerModule,
    RedisModule,
    ElasticSearchModule,
  ],
  controllers: [AppController],
  providers: [StartupService, AppService],
})
export class AppModule {}
