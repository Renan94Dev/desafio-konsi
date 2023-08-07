import { Browser, Page, chromium } from 'playwright';
import { AppUrlNotFoundError, AuthenticationError } from './errors';
import { ICrawler, IInput, ICrawlerOutput } from './interface';

export class ExtratoClubeCrawlerPlaywright implements ICrawler {
  async execute(input: IInput): Promise<ICrawlerOutput> {
    const {
      docNumber,
      auth: { login, password },
    } = input;

    if (!login || !password) {
      throw new AuthenticationError('User or password not found.');
    }

    const browser: Browser = await chromium.launch({
      headless: false,
      slowMo: 350,
    });
    const context = await browser.newContext();

    const initialDate = new Date().getTime();

    const page: Page = await context.newPage();
    await page.goto('http://www.extratoclube.com.br/');

    const appSourceUrl = await page.locator('frame').getAttribute('src');

    if (!appSourceUrl) {
      await browser.close();
      throw new AppUrlNotFoundError('App url not found.');
    }

    await page.goto(appSourceUrl);
    await page.waitForLoadState('load');

    await page.getByPlaceholder('Login').fill(login);
    await page.getByPlaceholder('Senha').fill(password);
    await page.getByRole('button', { name: 'Logar' }).click();

    await page.waitForSelector('ion-backdrop');
    await page.evaluate(() => {
      document
        .querySelectorAll('ion-backdrop')
        .forEach((el) => (el as HTMLElement).click());
    });

    await page.waitForSelector('ion-menu');
    await page.evaluate(() => {
      document
        .querySelectorAll('ion-menu')
        .forEach((el) => (el as HTMLElement).click());
    });

    await page.waitForTimeout(3000);

    await page
      .getByRole('button', {
        name: 'add outline Encontrar Benefícios de um CPF',
      })
      .click();

    await page.waitForTimeout(500);

    await page.getByLabel('Número do CPF :').fill(docNumber);
    await page.locator(':text(" Procurar")').click();
    await page.waitForTimeout(1000);
    const benefitsResult = await page
      .locator('ion-card-header:has-text("BENEFÍCIOS ENCONTRADOS!") ~ ion-item')
      .textContent();

    const benefits = benefitsResult.split('\n');

    await browser.close();

    const endDate = new Date().getTime();

    const duration = (endDate - initialDate) / 1000;

    console.log(`Duration: ${duration}`);

    return { docNumber, benefits };
  }
}
