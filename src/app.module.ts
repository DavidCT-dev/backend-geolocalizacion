import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { PermisosModule } from './permisos/permisos.module';
import { RutasModule } from './rutas/rutas.module';
import { JornadaModule } from './jornada/jornada.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', 
    }),

    MongooseModule.forRoot(process.env.MONGODB_URI_CLOUD || '', {
      connectionName: 'cloud',
    }),

    MongooseModule.forRoot(process.env.MONGODB_URI_LOCAL || '', {
      connectionName: 'local',
    }),

    UserModule,
    AuthModule,
    RolesModule,
    PermisosModule,
    RutasModule,
    JornadaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
