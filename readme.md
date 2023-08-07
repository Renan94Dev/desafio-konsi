# DESAFIO - CRAWLER KONSI

Este repositório contém a implementação de uma estratégia de geração de chave para estabelecer uma conexão Server-Sent Events (SSE) entre um cliente e um servidor. A abordagem adotada envolve a criação de uma chave única que é gerada pelo servidor e retornada ao cliente. O cliente, por sua vez, utiliza essa chave para abrir uma conexão SSE, onde ele aguardará a ocorrência de eventos disparados pelo servidor, utilizando a mesma chave para identificação.

## Funcionamento da Estratégia

1. O servidor gera uma chave única, que pode ser um token ou qualquer outro identificador único.
2. O servidor envia essa chave gerada para o cliente como parte da resposta a uma requisição.
3. O cliente recebe a chave e utiliza-a para estabelecer uma conexão SSE com o servidor.
4. O servidor dispara eventos utilizando a chave como parte da identificação do evento.
5. O cliente, com a conexão SSE aberta, ouve esses eventos.

## Configuração do Ambiente

Antes de executar o servidor e o cliente, é importante configurar o ambiente corretamente. Certifique-se de seguir as etapas abaixo:

1. **Preencha o arquivo `.env`**.

## Execução do Servidor e Cliente

Siga esses passos para executar o servidor e o cliente:

```bash
$ docker-compose up
```

## Aviso Importante

**ATENÇÃO:** Certifique-se de preencher corretamente o arquivo `.env` com as informações necessárias.
