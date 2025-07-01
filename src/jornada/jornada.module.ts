import { Module } from '@nestjs/common';
import { JornadaService } from './jornada.service';
import { JornadaGateway } from './jornada.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Ruta, RutaSchema } from '../rutas/schema/ruta.schema';
import { Asignacion, AsignacionSchema } from '../rutas/schema/asignacion.schema';
import { Jornada, JornadaSchema } from './schema/jornada.schema';

@Module({
  imports: [
          MongooseModule.forFeature([{ name: Jornada.name, schema: JornadaSchema }]),
          MongooseModule.forFeature([{ name: Ruta.name, schema: RutaSchema }]),
          MongooseModule.forFeature([{ name: Asignacion.name, schema: AsignacionSchema }]),
  
  ],
  providers: [JornadaGateway, JornadaService],
})
export class JornadaModule {}
