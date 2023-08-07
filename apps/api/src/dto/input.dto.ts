import {
  IsString,
  IsNotEmpty,
  Length,
  ValidateNested,
} from '@nestjs/class-validator';

class Auth {
  @IsNotEmpty()
  @IsString()
  login: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class InputDTO {
  @Length(14, 14, { message: 'invalid cpf number' })
  docNumber: string;

  @IsNotEmpty()
  @ValidateNested()
  auth: Auth;
}
