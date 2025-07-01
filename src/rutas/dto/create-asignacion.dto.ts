import { ApiProperty } from '@nestjs/swagger';

export class AsignacionDto {
  @ApiProperty()
  conductorId: string;

  @ApiProperty()
  rutaId: string;

  @ApiProperty()
  fecha: Date;
}