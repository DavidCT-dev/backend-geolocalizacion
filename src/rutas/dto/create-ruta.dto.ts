import { ApiProperty } from '@nestjs/swagger';


class CoordenadaRutaDto {
  @ApiProperty({ example: -19.582691681265903 })
  latitud: number;

  @ApiProperty({ example: -65.76055011743546 })
  longitud: number;
}

class CoordenadaParadaDto {
  @ApiProperty({ example: 'Parada principal' })
  nombre: string;

  @ApiProperty({ example: -19.577111821390133 })
  latitud: number;

  @ApiProperty({ example: -65.75629900556885 })
  longitud: number;
}




export class CreateRutaDto {
  nombre: string;

  rutaIda: CoordenadaRutaDto[];

  rutaVuelta?: CoordenadaRutaDto[];

  paradas?: CoordenadaParadaDto[];

  rutaAlternativaIda?: CoordenadaRutaDto[];

  rutaAlternativaVuelta?: CoordenadaRutaDto[];

  tieneVuelta?: boolean;
}
