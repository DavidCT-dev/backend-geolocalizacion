import { RegistroPasajeros, RegistroPasajerosDocument } from './schema/registro-pasajeros';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, UpdatePasswordDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service'
import { Role, RoleDocument } from '../roles/schema/role.schema';
import { ConfigurationApk, ConfigurationApkDocument } from './schema/configuration-apk.schema';
import { sendMailerVerificationLink } from '../helpers/sendEmail';
import { Jornada, JornadaDocument } from '../jornada/schema/jornada.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private rolModel: Model<RoleDocument>,
    @InjectModel(RegistroPasajeros.name) private registroPasajerosModel: Model<RegistroPasajerosDocument>,
    private readonly authService: AuthService,
    @InjectModel(ConfigurationApk.name) private configurationApkModel: Model<ConfigurationApkDocument>,
    @InjectModel(Jornada.name) private jornadaModel: Model<JornadaDocument>,


    // private readonly authService: AuthService

  ) { }

  async defaultUser() {
    // Buscar o crear el rol "administrador"
    let rolAdmin = await this.rolModel.findOne({ nombre: 'Administrador' });

    // Crear usuario admin si no existe
    const exists = await this.userModel.findOne({ email: 'admin@example.com' });

    if (!exists) {
      const hashed = await bcrypt.hash('admin123', 10);

      await this.userModel.create({
        nombre: 'Administrador del Sistema',
        ci: '12345678',
        email: 'admin@example.com',
        telefono: '70000000',
        state:true,
        password: hashed,
        rol: rolAdmin._id  // Asignar rol administrador
      });

    }
    return ('✅ Usuario admin creado y asignado al rol "administrador"');

  }


  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, ci, ...rest } = createUserDto;

    // Verificar si el correo ya está registrado
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const existingUserci = await this.userModel.findOne({ ci });
    if (existingUserci) {
      throw new BadRequestException('El CI ya esta registrado');
    }

    // Crear nuevo usuario
    const newUser = new this.userModel({
      ...rest,
      ci,
      email,
    });

    // 3. Generar token
    const payload = {
      id: newUser._id,
    };

    const authetication = this.authService.generarToken(payload);

    const send = await sendMailerVerificationLink(
      email,
      `${process.env.WEBSERVICE_URL}?token=${authetication}`
    );


    if (!send) {
      throw new BadRequestException('Error al verificar email');
    }


    return newUser.save();
  }

  async conductores() {
    const usuarios = await this.userModel.find().populate('rol');
    // return usuarios.filter(usuario => (usuario.rol as any)?.nombre === 'Conductor');
    return usuarios.filter(
      usuario => /conductor/i.test((usuario.rol as any)?.nombre ?? '')
    );
  }



  async findAll() {
    return await this.userModel.find().populate('rol');
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .select('-password')
      .populate({
        path: 'rol',
        populate: {
          path: 'permisoIds',
          select: 'nombre', // Opcional: solo traer el campo 'nombre'
        },
      })
      .exec();
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }


  async update(id: string, updateUserDto: any): Promise<User> {
    console.log(id, updateUserDto)

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true } // `new: true` devuelve el documento actualizado
    ).select('-password'); // no incluimos el password en la respuesta

    if (!updatedUser) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return updatedUser;
  }


  async updateDriver(id: string, updateUserDto: any): Promise<any> {
    const user = await this.userModel.findById(id).select('-password').exec();;
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    user.matricula = updateUserDto.matricula
    user.vehiculo = updateUserDto.vehiculo
    user.save();
    return user
  }



  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<string> {
    const { oldPassword, newPassword } = updatePasswordDto;

    // Buscar el usuario por ID
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Comparar la contraseña actual
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt();
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar la contraseña
    user.password = hashedNewPassword;
    await user.save();

    return 'Contraseña actualizada correctamente';
  }


  async remove(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    user.deleted = true;
    await user.save();

    return { message: 'Usuario eliminado (lógicamente)' };
  }

  async configApk(id: string, config) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const existingConfig = await this.configurationApkModel.findOne({ userId: user._id });

    const { mostrar_parada, registro_viaje } = config;

    if (existingConfig) {
      // Actualizar configuración existente
      existingConfig.mostrar_parada = mostrar_parada;
      existingConfig.registro_viaje = registro_viaje;
      await existingConfig.save();

      return { message: 'Configuración actualizada exitosamente' };
    } else {
      // Crear nueva configuración
      await this.configurationApkModel.create({
        userId: user._id,
        mostrar_parada,
        registro_viaje,
      });

      return { message: 'Configuración creada exitosamente' };
    }
  }
  async getConfigApk(userId: string) {
    const config = await this.configurationApkModel.findOne({ userId });

    return config;
  }


  async createRegisgroPasajeros(registro: any) {

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const existeRegistro = await this.registroPasajerosModel.findOne({
      userId: registro.userId,
      lineaId: registro.lineaId,
      conductorId: registro.conductorId,
      fecha: { $gte: hoy },
      deleted: false
    });

    if (existeRegistro) {
      return ('Ya existe un registro para este usuario en esta línea hoy');
    }
    const user = await this.configurationApkModel.findOne({ userId: registro.conductorId })
    if (user.registro_viaje) {
      // Crear nuevo registro
      const nuevoRegistro = new this.registroPasajerosModel({
        ...registro,
        fecha: new Date() // Sobrescribir la fecha con la actual
      });

      return await nuevoRegistro.save();
    }
    return ('no tiene habilitado la opcion registro de viaje');


  }

  async confirmPassword(data: { token: string; password: string }) {
    const { token, password } = data;

    // Verificar y decodificar el token
    const decoded = await this.authService.verificarToken(token);
    if (!decoded || !decoded.id) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Buscar usuario
    const user = await this.userModel.findById(decoded.id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Validar que la contraseña cumpla ciertos criterios (opcional)
    if (password.length < 8) {
      throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
    }

    if (user.state==true) {
      throw new BadRequestException('La cuenta ya ha sido confirmada');
    }
    
    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.state = true;

    // Guardar cambios en la base de datos
    await user.save();

    return { message: 'Contraseña actualizada correctamente' };
  }

  async findAllRegistro(userId: string) {
    return this.registroPasajerosModel.find({ userId, deleted: false }).exec();
  }


  async getAllReports(month: string, conductorId?: string) {
    const startDate = new Date(month)
    const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1)) 

    const query: any = {
      fecha: {
        $gte: startDate,
        $lt: endDate
      }
    };

    if (conductorId) {
      query.conductorId = conductorId;
    }

    return this.jornadaModel.find(query)
      .populate('conductorId', 'nombre ci vehiculo matricula')
      .populate('lineaId', 'nombre')
      .sort({ fecha: 1 });
  }


}
