import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DecodedTokenDto, LoginAuthDto, RegisterAuthDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/schema/user.schema';
import { Model } from 'mongoose';
import { Role, RoleDocument } from 'src/roles/schema/role.schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private rolModel: Model<RoleDocument>

  ) { }

  generarToken(payload: any) {
    return this.jwtService.sign(payload);
  }

  verificarToken(token: string) {
    return this.jwtService.verify(token);
  }

   async loginMobile(loginDto: any) {
    const { email, password } = loginDto;

    // 1. Buscar usuario por email
    const usuario = await this.userModel.findOne({ email });
    if (!usuario) {
      throw new NotFoundException('Credenciales incorrectas');
    }

    // Verificar si el usuario está marcado como eliminado (si tienes este campo)
    if (usuario.deleted === true) {
      throw new NotFoundException('Credenciales incorrectas');
    }

    // 2. Comparar contraseña
    const match = await bcrypt.compare(password, usuario.password);
    if (!match) {
      throw new NotFoundException('Credenciales incorrectas');
    }

    // 3. Generar token
    const payload = {
      id: usuario._id,
    };

    const token = this.generarToken(payload);

    // Eliminar password antes de devolver el usuario
    const usuarioSinPassword = usuario.toObject();
    delete usuarioSinPassword.password;

    // 4. Retornar datos
    return {
      message: 'Login exitoso',
      token,
      usuario: usuarioSinPassword
    };
  }

  async registerMobile(registerMobileAuthDto: any) {
    const { nombre, email, password, ci } = registerMobileAuthDto;
    // Verificar si el usuario ya existe
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new UnauthorizedException('El email ya está registrado');
    }

    // Hash del password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear nuevo usuario
    const rol= await this.rolModel.findOne({nombre:'Pasajero'})

    await this.userModel.create({
      nombre,
      email,
      password: hashedPassword,
      rol:rol._id,
      ci
    });

    return {
      nombre,
      email,
    }
  }



  async singin(loginDto: LoginAuthDto) {
    const { email, password } = loginDto;

    // 1. Buscar usuario por email
    const usuario = await this.userModel.findOne({ email }).populate({
      path: 'rol',
      populate: {
        path: 'permisoIds',
        select: 'nombre', // Opcional: solo traer el campo 'nombre'
      },
    });
    if (!usuario) {
      throw new NotFoundException('Credenciales incorrectas');
    }

    if (usuario.deleted == true) {
      throw new NotFoundException('Credenciales incorrectas');
    }
    
    if (usuario.state == false) {
      throw new NotFoundException('Verifique su email');
    }

    // 2. Comparar contraseña
    const match = await bcrypt.compare(password, usuario.password);
    if (!match) {
      throw new NotFoundException('Credenciales incorrectas');
    }
    // 3. Generar token
    const payload = {
      id: usuario._id,
    };

    const token = this.generarToken(payload);

    // 4. Retornar datos
    return {
      message: 'Login exitoso',
      token,
      usuario
    };
  }

  decoded(token: DecodedTokenDto) {
    const decoded = this.jwtService.decode(token.token);
    if (!decoded) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    return {
      message: 'Token decodificado correctamente',
      payload: decoded,
    };
  }


}
