import { Module } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Permiso, PermisoSchema } from './schema/permiso.schema';
import { Role, RoleSchema } from 'src/roles/schema/role.schema';

@Module({
  imports: [
      MongooseModule.forFeature([
        { name: Permiso.name, schema: PermisoSchema },
        { name: Role.name, schema: RoleSchema }
      ]),
    ],
  controllers: [PermisosController],
  providers: [PermisosService],
})
export class PermisosModule {}
