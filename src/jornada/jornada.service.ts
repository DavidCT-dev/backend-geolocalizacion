import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '@nestjs/websockets';
import { InjectModel } from '@nestjs/mongoose';
import { Jornada, JornadaDocument } from './schema/jornada.schema';
import { Model } from 'mongoose';


@Injectable()
export class JornadaService {
  constructor(
    @InjectModel(Jornada.name) private jornadaModel: Model<JornadaDocument>
  ) { }


  async create(createJornadaDto: any) {
    const {
      conductorId,
      timestamp,
      lineaId,
      latitud,
      longitud,
      estado,
    } = createJornadaDto;

    // Validación básica de datos
    if (!conductorId || !timestamp || !lineaId || !estado) {
      throw new Error('Datos incompletos para registrar la jornada');
    }

    const fecha = new Date(timestamp);

    const year = fecha.getUTCFullYear();
    const month = fecha.getUTCMonth();
    const day = fecha.getUTCDate();
    const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    // Fin del mismo día en UTC
    const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));


    let jornada = await this.jornadaModel.findOne({
      conductorId,
      fecha: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });
    console.log(jornada, fecha, startOfDay, endOfDay)
    // Si la jornada ya está inactiva, no hacemos más actualizaciones
    if (jornada?.estado === 'inactiva') {
      return {
        latitud,
        longitud,
        message: 'Jornada ya finalizada, no se realizan más actualizaciones'
      };
    }

    const timestampDate = new Date(timestamp);
    const fechaTimestamp = timestampDate.getTime();

    // Si no existe jornada, creamos una nueva
    if (!jornada) {
      jornada = await this.jornadaModel.create({
        conductorId,
        lineaId,
        fecha: fecha,
        estado,
        inicio: estado === 'activa' ? timestampDate : null,
        horasTrabajadas: 0,
      });

      return {
        latitud,
        longitud,
        message: 'Nueva jornada creada'
      };
    }

    // Lógica para calcular horas trabajadas
    let tiempoTrabajado = 0;

    // Transición de activa a pausada
    if (jornada.estado == 'activa' && estado == 'pausada' && jornada.inicio) {
      const desde = new Date(jornada.inicio).getTime();
      tiempoTrabajado = (fechaTimestamp - desde) / (1000 * 60 * 60); // en horas
      jornada.horasTrabajadas += tiempoTrabajado;
      jornada.inicio = null;

    }

    // Transición de pausada a activa
    if (jornada.estado == 'pausada' && estado == 'activa') {
      jornada.inicio = timestampDate;
    }

    // Finalización de jornada
    if (estado == 'inactiva' && jornada.inicio) {
      const desde = new Date(jornada.inicio).getTime();
      tiempoTrabajado = (fechaTimestamp - desde) / (1000 * 60 * 60); // en horas
      jornada.horasTrabajadas += tiempoTrabajado;
      jornada.inicio = null;
    }

    // Actualizar el estado
    jornada.estado = estado;

    // Guardar los cambios
    await jornada.save();

    return {
      latitud,
      longitud,
      message: 'Jornada actualizada correctamente',
      horasTrabajadas: jornada.horasTrabajadas
    };
  }


  findAll() {
    return `This action returns all jornada`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jornada`;
  }

  update(id: number, updateJornadaDto: any) {
    return `This action updates a #${id} jornada`;
  }

  remove(id: number) {
    return `This action removes a #${id} jornada`;
  }
}
