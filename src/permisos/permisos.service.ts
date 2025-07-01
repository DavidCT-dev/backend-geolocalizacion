import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { Permiso, PermisoDocument } from './schema/permiso.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Role, RoleDocument } from 'src/roles/schema/role.schema';

@Injectable()
export class PermisosService {
  constructor(
    @InjectModel(Permiso.name) private permisoModel: Model<PermisoDocument>,
    @InjectModel(Role.name) private rolModel: Model<RoleDocument>,

  ) {

  }
  async defaultRoles() {
  // 1. Crear permisos por defecto si no existen
  const permisosPorDefecto = [
    'perfil',
    'usuarios',
    'crear-usuario',
    'editar-usuario',
    'eliminar-usuario',

    'conductor',
    'editar-conductor',
    'eliminar-conductor',
    
    'ruta',
    'crear-ruta',
    'editar-ruta',
    'eliminar-ruta',

    'asignacion',
    'crear-asignacion',

    'jornada',
    'registro',
    'crear-rol',
    'actualizar-rol'
  ];

  const permisosIdsMap: Record<string, any> = {};

  for (const nombre of permisosPorDefecto) {
    let permiso = await this.permisoModel.findOne({ nombre });

    if (!permiso) {
      permiso = await this.permisoModel.create({ nombre });
      console.log(`✅ Permiso '${nombre}' creado`);
    }

    permisosIdsMap[nombre] = permiso._id;
  }

  // 2. Crear rol "administrador" si no existe
  const rolExistente = await this.rolModel.findOne({ nombre: 'administrador' });

  if (!rolExistente) {
    // Permisos para el rol Administrador (todos excepto jornada y registro)
    const permisosAdministrador = Object.keys(permisosIdsMap)
      .filter(nombre => nombre !== 'jornada' && nombre !== 'registro')
      .map(nombre => permisosIdsMap[nombre]);

    // Permisos para el rol Conductor
    const permisosConductor = [
      permisosIdsMap['perfil'],
      permisosIdsMap['jornada'],
      permisosIdsMap['registro'],
    ];

    // Permisos para el rol Pasajero (solo perfil)
    const permisosPasajero = [
      permisosIdsMap['perfil']
    ];

    await this.rolModel.create({
      nombre: 'Administrador',
      permisoIds: permisosAdministrador
    });

    await this.rolModel.create({
      nombre: 'Conductor',
      permisoIds: permisosConductor
    });

    await this.rolModel.create({
      nombre: 'Pasajero',
      permisoIds: permisosPasajero
    });

    return('✅ Roles por defecto creados');
  }
}


  async findAll() {
   return await this.permisoModel.find();
  }




}
