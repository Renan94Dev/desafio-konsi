import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  RABBITMQ_CRAWLER_SEARCH_QUEUE,
  RABBITMQ_CRAWLER_QUEUE_TOKEN_SERVICE,
} from 'src/constants/index.constants';

@Module({
  imports: [
    ClientsModule.registerAsync({
      clients: [
        {
          name: RABBITMQ_CRAWLER_QUEUE_TOKEN_SERVICE,
          useFactory: (configService: ConfigService) => {
            const url = configService.get<string>('RABBITMQ_URL');

            return {
              transport: Transport.RMQ,
              options: {
                urls: [url],
                queue: RABBITMQ_CRAWLER_SEARCH_QUEUE,
                queueOptions: {
                  durable: true,
                },
              },
            };
          },
          inject: [ConfigService],
        },
      ],
    }),
  ],
  providers: [],
  exports: [ClientsModule],
})
export class RabbitMQModule {}
