import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { ApiTags } from '@nestjs/swagger/dist/decorators';

@ApiTags('permisos')
@Controller('api/permisos')
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}
  @Get()
  findAll() {
    return this.permisosService.findAll();
  }

  @Get('default')
  permisosDefault() {
    return this.permisosService.defaultRoles();
  }

 
}
