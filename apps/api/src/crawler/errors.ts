export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AppUrlNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppUrlNotFoundError';
  }
}
