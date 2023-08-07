import { Module } from '@nestjs/common';
import { Crawler } from './crawler';
import { ExtratoClubeCrawler } from './extratoClubeCrawler';
import { ICrawler } from './interface';

@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: ExtratoClubeCrawler,
      useClass: ExtratoClubeCrawler,
    },
    {
      provide: Crawler,
      useFactory: (source: ICrawler) => new Crawler(source),
      inject: [ExtratoClubeCrawler],
    },
  ],
  exports: [Crawler],
})
export class CrawlerModule {}
