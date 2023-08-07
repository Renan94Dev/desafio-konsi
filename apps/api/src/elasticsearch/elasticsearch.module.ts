import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.register({
      nodes: ['http://elasticsearch:9200'],
    }),
  ],
  // imports: [
  //   ElasticsearchModule.registerAsync({
  //     imports: [ConfigModule],
  //     useFactory: (configService: ConfigService) => {
  //       const nodeUrl = configService.get<string>('ELASTICSEARCH_URL');

  //       return {
  //         node: [nodeUrl],
  //       };
  //     },
  //     inject: [ConfigService],
  //   }),
  // ],
  providers: [],
  exports: [ElasticsearchModule],
})
export class ElasticSearchModule {}
