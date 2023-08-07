import axios from 'axios';
import { LoginHeader } from './headers';

describe('crawler test', () => {
  it('should return status code 200 for success login', async () => {
    const payload = {
      login: '',
      senha: '',
    };

    if (!payload.login || !payload.senha) {
      throw new Error('User or password not found to run test.');
    }

    const response = await axios({
      method: 'POST',
      headers: LoginHeader,
      url: `http://extratoblubeapp-env.eba-mvegshhd.sa-east-1.elasticbeanstalk.com/login`,
      data: payload,
    });

    expect(response.status).toEqual(200);
  });
});
