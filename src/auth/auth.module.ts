import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Role, RoleSchema } from 'src/roles/schema/role.schema';

@Module({
  imports: [
      MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
      JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: 'secreto_super_secreto',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1d',
        },
      }),
      inject: [ConfigService],
    }),

    ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule], 
})
export class AuthModule {}
