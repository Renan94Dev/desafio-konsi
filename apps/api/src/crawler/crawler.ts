import { ICrawler, IInput } from './interface';

export class Crawler {
  constructor(private readonly source: ICrawler) {}

  init(input: IInput) {
    return this.source.execute(input);
  }
}
