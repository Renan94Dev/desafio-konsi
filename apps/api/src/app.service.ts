import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID as uuid } from 'node:crypto';
import { lastValueFrom } from 'rxjs';
import {
  RABBITMQ_CRAWLER_QUEUE_TOKEN_SERVICE,
  ELASTICSEARCH_CLIENT_INDEX,
  RABBITMQ_EVENT_PATTERN,
} from './constants/index.constants';
import { InputDTO } from './dto/input.dto';
import { OutputDTO } from './dto/output.dto';
import { sanizedString } from './utils/helpers';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class AppService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(RABBITMQ_CRAWLER_QUEUE_TOKEN_SERVICE)
    private readonly commucationClient: ClientProxy,
    private readonly elasticSearchClient: ElasticsearchService,
  ) {}

  async search(input: InputDTO): Promise<OutputDTO> {
    const key = uuid();

    const elasticSearchResult =
      await this.elasticSearchClient.search<IDocument>({
        query: {
          match: {
            docNumber: input.docNumber,
          },
        },
      });

    if (elasticSearchResult.hits.hits.length > 0) {
      this.sseEventEmitter({
        key,
        benefits: elasticSearchResult.hits.hits[0]._source.benefits,
      });
      return;
    }

    const sanizedInput = {
      docNumber: sanizedString(input.docNumber),
      auth: {
        login: input.auth.login,
        password: input.auth.password,
      },
    };

    await lastValueFrom(
      this.commucationClient.emit(RABBITMQ_EVENT_PATTERN, {
        data: {
          key,
          sanizedInput,
        },
      }),
    );

    return {
      key,
    };
  }

  async indexClientBenefits({ docNumber, benefits }: IDocument) {
    await this.elasticSearchClient.index({
      index: ELASTICSEARCH_CLIENT_INDEX,
      id: docNumber,
      body: {
        benefits,
      },
    });
  }

  sseEventEmitter({ key, benefits: benefit }: ISseEventEmitterInput) {
    return this.eventEmitter.emit('sse', {
      type: key,
      data: {
        result: benefit,
      },
    });
  }
}

export interface IDocument {
  docNumber: string;
  benefits: string[];
}

export interface ISseEventEmitterInput {
  key: string;
  benefits: string[];
}

export interface IPayload {
  data: {
    sanizedInput: InputDTO;
    key: string;
  };
}
