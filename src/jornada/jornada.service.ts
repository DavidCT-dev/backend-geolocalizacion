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
    const fechaUTC = new Date(Date.UTC(
      fecha.getUTCFullYear(),
      fecha.getUTCMonth(),
      fecha.getUTCDate()
    ));

    // Buscar jornada existente para el día
    const jornada = await this.jornadaModel.findOne({
      conductorId,
      fecha: fechaUTC
    });

    // Si la jornada ya está inactiva, no permitir cambios
    if (jornada?.estado === 'inactiva') {
      return {
        latitud,
        longitud,
        message: 'Jornada ya finalizada, no se realizan más actualizaciones',
        estado: 'inactiva'
      };
    }

    const timestampDate = new Date(timestamp);

    // Crear nueva jornada si no existe
    if (!jornada) {
      const nuevaJornada = await this.jornadaModel.create({
        conductorId,
        lineaId,
        fecha: fechaUTC,
        estado,
        hora_inicio: estado === 'activa' ? timestampDate : null,
        horasTrabajadas: 0,
        numeroVueltas: 0
      });

      return {
        latitud,
        longitud,
        message: 'Nueva jornada creada',
        estado: nuevaJornada.estado,
        hora_inicio: nuevaJornada.hora_inicio
      };
    }

    // Lógica para transiciones de estado
    let tiempoTrabajado = 0;

    // Transición de activa a pausada
    if (jornada.estado === 'activa' && estado === 'pausada' && jornada.hora_inicio) {
      const desde = new Date(jornada.hora_inicio).getTime();
      tiempoTrabajado = (timestampDate.getTime() - desde) / (1000 * 60 * 60); // en horas
      jornada.horasTrabajadas += tiempoTrabajado;
    }

    // Transición de pausada a activa
    if (jornada.estado === 'pausada' && estado === 'activa') {
      jornada.hora_inicio = timestampDate;
    }

    // Finalización de jornada
    if (estado === 'inactiva' && jornada.hora_inicio) {
      const desde = new Date(jornada.hora_inicio).getTime();
      tiempoTrabajado = (timestampDate.getTime() - desde) / (1000 * 60 * 60); // en horas
      jornada.horasTrabajadas += tiempoTrabajado;
      jornada.hora_fin = timestampDate;
    }

    // Actualizar el estado
    jornada.estado = estado;
    await jornada.save();

    return {
      latitud,
      longitud,
      message: 'Jornada actualizada correctamente',
      estado: jornada.estado,
      horasTrabajadas: jornada.horasTrabajadas,
      hora_inicio: jornada.hora_inicio,
      hora_fin: jornada.hora_fin
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
