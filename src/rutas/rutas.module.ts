import { Module } from '@nestjs/common';
import { RutasService } from './rutas.service';
import { RutasController } from './rutas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Ruta, RutaSchema } from './schema/ruta.schema';
import { Asignacion, AsignacionSchema } from './schema/asignacion.schema';
import { Jornada, JornadaSchema } from 'src/jornada/schema/jornada.schema';

@Module({
   imports: [
        MongooseModule.forFeature([{ name: Ruta.name, schema: RutaSchema }]),
        MongooseModule.forFeature([{ name: Asignacion.name, schema: AsignacionSchema }]),
        MongooseModule.forFeature([{ name: Jornada.name, schema: JornadaSchema }]),
    ],
  controllers: [RutasController],
  providers: [RutasService],
})
export class RutasModule {}
