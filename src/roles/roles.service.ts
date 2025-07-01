import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schema/role.schema';
import { Model } from 'mongoose';

@Injectable()
export class RolesService {

  constructor(
    @InjectModel(Role.name) private rolModel: Model<RoleDocument>
  ) { }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { nombre, permisoIds } = createRoleDto;

    // Validación simple (puedes agregar más lógica si lo deseas)
    const existing = await this.rolModel.findOne({ nombre });
    if (existing) {
      throw new BadRequestException('Ya existe un rol con ese nombre');
    }

    const nuevoRol = new this.rolModel({
      nombre,
      permisoIds,
    });

    return await nuevoRol.save();
  }

  async findAll() {
    return await this.rolModel.find().populate('permisoIds');
  }

  async update(id: string, updateRoleDto: any): Promise<Role | null> {

    // ✅ Verifica que el rol exista
    const existingRole = await this.rolModel.findById(id);
    if (!existingRole) {
      throw new NotFoundException(`Rol no encontrado`);
    }

    return this.rolModel.findByIdAndUpdate(
      id,updateRoleDto,{ new: true },
    );
  }

}
