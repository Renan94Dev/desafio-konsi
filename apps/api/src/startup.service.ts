import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { documentsList } from './crawler/documents-list';
import {
  RABBITMQ_CRAWLER_QUEUE_TOKEN_SERVICE,
  RABBITMQ_EVENT_PATTERN,
} from './constants/index.constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StartupService implements OnApplicationBootstrap {
  constructor(
    private readonly configService: ConfigService,
    @Inject(RABBITMQ_CRAWLER_QUEUE_TOKEN_SERVICE)
    private readonly rabbitmqClient: ClientProxy,
  ) {}

  onApplicationBootstrap() {
    console.log('Inseridos a lista de documentos da fila do rabbitmq...');

    const auth = {
      login: this.configService.get('PORTAL_LOGIN'),
      password: this.configService.get('PORTAL_PASSWORD'),
    };

    for (const document of documentsList) {
      this.rabbitmqClient.emit(RABBITMQ_EVENT_PATTERN, {
        data: {
          sanizedInput: {
            docNumber: document,
            auth,
          },
        },
      });
    }

    console.log('Lista inserida.');
  }
}
