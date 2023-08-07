import { Body, Controller, Post, Res, Sse } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Response } from 'express';
import { Redis } from 'ioredis';
import { Observable, fromEvent, tap } from 'rxjs';
import { AppService, IPayload, ISseEventEmitterInput } from './app.service';
import { RABBITMQ_EVENT_PATTERN } from './constants/index.constants';
import { Crawler } from './crawler/crawler';
import { ICrawlerOutput } from './crawler/interface';
import { InputDTO } from './dto/input.dto';
import { OutputDTO } from './dto/output.dto';

export interface MessageEvent {
  data: OutputDTO;
  id?: string;
  type?: string;
  retry?: number;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly eventEmitter: EventEmitter2,
    private readonly crawler: Crawler,
    private readonly clientRedis: Redis,
  ) {}

  @Post('search')
  async getClientNumberHandler(@Body() input: InputDTO): Promise<OutputDTO> {
    return await this.appService.search(input);
  }

  @Sse('sse')
  sse(@Res() response: Response): Observable<any> {
    return fromEvent(this.eventEmitter, 'sse').pipe(
      tap(() => {
        setTimeout(() => {
          response.end();
        }, 1000);
      }),
    );
  }

  @EventPattern(RABBITMQ_EVENT_PATTERN)
  async handleMessage(
    @Payload() payload: IPayload,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    const inputDocNumber = payload.data.sanizedInput.docNumber;

    const documentInRedis = await this.clientRedis.get(inputDocNumber);

    let benefitsResult: ICrawlerOutput;

    if (!documentInRedis) {
      benefitsResult = await this.crawler.init({
        ...payload.data.sanizedInput,
      });

      await this.clientRedis.set(
        inputDocNumber,
        JSON.stringify(benefitsResult),
      );

      if (!benefitsResult.benefits.includes('Matrícula não encontrada!')) {
        await this.appService.indexClientBenefits({
          docNumber: inputDocNumber,
          benefits: benefitsResult.benefits,
        });
      }
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    const data: ISseEventEmitterInput = {
      key: payload.data.key,
      benefits: JSON.parse(documentInRedis) ?? benefitsResult,
    };

    this.appService.sseEventEmitter(data);

    channel.ack(message);
  }
}
