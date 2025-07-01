import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, Put } from '@nestjs/common';
import { RutasService } from './rutas.service';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { AsignacionDto } from './dto/create-asignacion.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('rutas')
@Controller('api/rutas')
export class RutasController {
  constructor(private readonly rutasService: RutasService) { }

  @Post()
  create(@Body() createRutaDto: CreateRutaDto) {
    return this.rutasService.create(createRutaDto);
  }

  @Post('asignacion')
  asignarLinea(@Body() asignacionDto: any) {
    return this.rutasService.asignarMultiples(asignacionDto);
  }


  @Get('asignacion')
  async obtenerAsignaciones(
    @Query('fecha') fecha: string,
    @Query('conductorId') conductorId?: string,
  ) {
    if (!fecha) {
      throw new BadRequestException('El parámetro "fecha" es obligatorio');
    }

    return await this.rutasService.listaAsignacion(fecha, conductorId);
  }

  @Get('obtener/linea')
  async obtenerLinea(
    @Query('fecha') fecha: string,
    @Query('conductorId') conductorId: string,
  ) {
    if (!fecha) {
      throw new BadRequestException('El parámetro "fecha" es obligatorio');
    }
    return await this.rutasService.obtenerLinea(fecha, conductorId);
  }

  @Get()
  findAll() {
    return this.rutasService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRutaDto: any) {
    return this.rutasService.update(id, updateRutaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rutasService.remove(id);
  }


  @Get('jornada/:id/:fecha')
  getJornada(@Param('id') id: string,@Param('fecha') fecha: string) {
    return this.rutasService.getJornada(id,fecha);
  }


}
