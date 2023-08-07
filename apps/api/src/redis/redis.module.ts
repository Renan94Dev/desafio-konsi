import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { Redis } from 'ioredis';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: Redis,
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST');
        const port = config.get<string>('REDIS_PORT');

        return new Redis({
          host,
          port: parseInt(port),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [Redis],
})
export class RedisModule {}
