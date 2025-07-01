import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateDriverDto, UpdatePasswordDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('api/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) { }

  @Get('default')
  default() {
    return this.userService.defaultUser();
  }

  @Post('registro')
  createRegisgroPasajeros(@Body() createRegistroDto: any) {
    return this.userService.createRegisgroPasajeros(createRegistroDto);
  }

  @Get('registro')
  async findByUser(@Param('userId') userId: string) {
    return await this.userService.findAllRegistro(userId);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('drivers')
  conductores() {
    return this.userService.conductores();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: CreateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Put('update-driver/:id')
  updateDriver(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.userService.updateDriver(id, updateDriverDto);
  }

  @Put('update-password/:id')
  updatePassword(@Param('id') id: string, @Body() updatePasswordDto: UpdatePasswordDto) {
    return this.userService.updatePassword(id, updatePasswordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Put('config/:id')
  configApk(@Param('id') id: string, @Body() config: { mostrar_parada: boolean, registro_viaje: boolean }) {
    return this.userService.configApk(id, config);
  }
  @Get('config/:id')
  getConfigApk(@Param('id') id: string) {
    return this.userService.getConfigApk(id);
  }


  @Post('confirm-password')
  confirmPassword(@Body() data: { token: string, password: string }) {
    return this.userService.confirmPassword(data);
  }

  @Get('jornada')
  async getReports(
    @Query('month') month: string,
    @Query('conductorId') conductorId?: string
  ) {
    return this.userService.getAllReports(month, conductorId);
  }
}
