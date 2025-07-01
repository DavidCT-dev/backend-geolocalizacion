import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';
import { Role, RoleSchema } from '../roles/schema/role.schema';
import { ConfigurationApk, ConfigurationApkSchema } from './schema/configuration-apk.schema';
import { RegistroPasajeros, RegistroPasajerosSchema } from './schema/registro-pasajeros';
import { Jornada, JornadaSchema } from '../jornada/schema/jornada.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),        MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    MongooseModule.forFeature([{ name: RegistroPasajeros.name, schema: RegistroPasajerosSchema }]),
    MongooseModule.forFeature([{ name: ConfigurationApk.name, schema: ConfigurationApkSchema }]),
    MongooseModule.forFeature([{ name: Jornada.name, schema: JornadaSchema }]),
    AuthModule
  ],
  controllers: [UserController],
  providers: [UserService,AuthService],
})
export class UserModule {}
