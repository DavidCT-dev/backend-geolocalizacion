import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { PermisosModule } from './permisos/permisos.module';
import { RutasModule } from './rutas/rutas.module';
import { JornadaModule } from './jornada/jornada.module';
import { BackupModule } from './backup/backup.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
     MongooseModule.forRoot(process.env.MONGODB_URI_CLOUD || 'mongodb://localhost/geolocalizacion'), 
    UserModule,
    AuthModule,
    RolesModule,
    PermisosModule,
    RutasModule,
    JornadaModule,
    BackupModule
  ],
  controllers: [],
  providers: [
    
  ],
})
export class AppModule {}
