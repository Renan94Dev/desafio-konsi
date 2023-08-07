export interface ICrawler {
  execute(input: IInput): Promise<ICrawlerOutput>;
}

export type IInput = ICrawlerInput;

export interface ICrawlerInput {
  docNumber: string;
  auth: {
    login: string;
    password: string;
  };
}

export interface ICrawlerOutput {
  docNumber: string;
  benefits: string[];
}
