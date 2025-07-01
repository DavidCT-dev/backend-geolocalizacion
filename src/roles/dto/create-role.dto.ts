import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
    @ApiProperty()
    nombre: string;
  
     // Array de IDs de permisos referenciados
    @ApiProperty()
    permisoIds: [];
}
