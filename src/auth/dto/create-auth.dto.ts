import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}

export class RegisterAuthDto {
  @ApiProperty()
  nombre: string;

  @ApiProperty()
  ci: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  telefono: string;

  @ApiProperty()
  password: string;
}


export class DecodedTokenDto{
  @ApiProperty()
  token: string;
}