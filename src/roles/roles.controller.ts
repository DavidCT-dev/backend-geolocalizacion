import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('roles')
@Controller('api/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Put(':id')
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: any,) {
    return await this.rolesService.update(id, updateRoleDto);
  }

}
