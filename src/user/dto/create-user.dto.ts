import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

export class CreateUserDto {
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
  
  @ApiProperty()
    avatar: string;

  vehiculo?: string;

  matricula?: string;

  deleted?: boolean;

  @ApiProperty({ type: String })
  rol: mongoose.Schema.Types.ObjectId | string;
}


export class UpdatePasswordDto {
  @ApiProperty()
    newPassword: string;
  
  @ApiProperty()
    oldPassword: string;
}


export class UpdateDriverDto {
  @ApiProperty()
    vehiculo?: string;
  
  @ApiProperty()

  matricula?: string;
}