import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserAuthenticationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
