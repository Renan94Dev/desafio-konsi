import axios from 'axios';
import { AppUrlNotFoundError, AuthenticationError } from './errors';
import { LoginHeader } from './headers';
import { ICrawler, ICrawlerOutput, IInput } from './interface';

let cachedLoginHeader: any = null;

export class ExtratoClubeCrawler implements ICrawler {
  async execute(input: IInput): Promise<ICrawlerOutput> {
    const {
      docNumber,
      auth: { login, password },
    } = input;

    if (!login || !password) {
      throw new AuthenticationError('User or password not found.');
    }

    const payload = {
      login: input.auth.login,
      senha: input.auth.password,
    };

    let loginResponse: any = null;

    if (!cachedLoginHeader) {
      loginResponse = await axios({
        method: 'POST',
        headers: LoginHeader,
        url: `http://extratoblubeapp-env.eba-mvegshhd.sa-east-1.elasticbeanstalk.com/login`,
        data: payload,
      });
    }

    if (loginResponse && loginResponse.status !== 200) {
      throw new AuthenticationError('Cannot login.');
    }

    cachedLoginHeader = loginResponse?.headers;

    const benefitNumbersResponse = await axios({
      method: 'GET',
      url: `http://extratoblubeapp-env.eba-mvegshhd.sa-east-1.elasticbeanstalk.com/offline/listagem/${docNumber}`,
      headers: cachedLoginHeader ?? loginResponse.headers,
    });

    if (benefitNumbersResponse.status !== 200) {
      throw new AppUrlNotFoundError('Cannot get benefit numbers.');
    }

    const benefitNumbers = benefitNumbersResponse.data.beneficios.reduce(
      (acc, curr) => {
        acc.push(curr.nb);
        return acc;
      },
      [],
    );

    return {
      docNumber: docNumber,
      benefits: benefitNumbers,
    };
  }
}
