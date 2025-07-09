import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Ruta, RutaDocument } from './schema/ruta.schema';
import { Model, Types } from 'mongoose';
import { Asignacion, AsignacionDocument } from './schema/asignacion.schema';
import { Jornada, JornadaDocument } from '../jornada/schema/jornada.schema';
import dayjs from 'dayjs';

@Injectable()
export class RutasService {
  constructor(
    @InjectModel(Ruta.name) private rutaModel: Model<RutaDocument>,
    @InjectModel(Asignacion.name) private asignacionModel: Model<AsignacionDocument>,
    @InjectModel(Jornada.name) private jornadaModel: Model<JornadaDocument>
  ) { }



  async asignarMultiples(asignacionesDto: any) {
    const resultados = [];
    const asignacionesCreadas = [];
    for (const asignacionDto of asignacionesDto.asignaciones) {
      // Verifica si ya tiene una asignación ese día, sin importar la ruta
      const yaAsignado = await this.asignacionModel.findOne({
        conductorId: asignacionDto.conductorId,
        fecha: asignacionDto.fecha,
      });

      if (!yaAsignado) {
        const nuevaAsignacion = new this.asignacionModel(asignacionDto);
        const guardada = await nuevaAsignacion.save();
        asignacionesCreadas.push(guardada);
        resultados.push({
          success: true,
          message: 'Asignación creada',
          data: guardada
        });
      } else {
        resultados.push({
          success: false,
          message: `El conductor ya tiene una asignación para la fecha ${new Date(asignacionDto.fecha).toLocaleDateString()}`,
          data: yaAsignado
        });
      }
    }

    return {
      creadas: asignacionesCreadas?.length || 0,
      existentes: (asignacionesDto.asignaciones.length || 0) - (asignacionesCreadas?.length || 0),
    };

  }

  async listaAsignacion(fecha: string | Date, conductorId?: string) {
    const fechaObj = new Date(fecha);
    const anio = fechaObj.getUTCFullYear();
    const mes = fechaObj.getUTCMonth(); // 0-indexado

    // Inicio del mes en UTC
    const fechaInicio = new Date(Date.UTC(anio, mes, 1, 0, 0, 0, 0));

    // Fin del mes en UTC: último milisegundo del último día
    const fechaFin = new Date(Date.UTC(anio, mes + 1, 1, 0, 0, 0, 0) - 1);

    const filtro: any = {
      fecha: {
        $gte: fechaInicio,
        $lte: fechaFin,
      },
    };

    if (conductorId) {
      filtro.conductorId = conductorId;
    }

    return await this.asignacionModel.find(filtro)
      .populate('conductorId', 'nombre ci')
      .populate('rutaId', 'nombre')
      .exec();
  }

  async obtenerLinea(fecha: string | Date, conductorId: string) {
    // Convertir a objeto Date si es string
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    
    // Asegurarse de que la fecha está en UTC
    const fechaUTC = new Date(Date.UTC(
        fechaObj.getFullYear(),
        fechaObj.getMonth(),
        fechaObj.getDate()
    ));

    // Crear rango de fechas en UTC
    const inicioDelDia = new Date(fechaUTC);
    const finDelDia = new Date(fechaUTC);
    finDelDia.setUTCHours(23, 59, 59, 999);

    console.log(fecha)
    const conductor = await this.asignacionModel.findOne({
       fecha: {
            $gte: inicioDelDia.toISOString(),
            $lte: finDelDia.toISOString()
        },
        conductorId: conductorId
    })
        .populate('conductorId', 'nombre ci')
        .populate('rutaId', 'nombre rutaIda rutaVuelta paradas rutaAlternativaIda rutaAlternativaVuelta tieneVuelta estadoRutaAlternativa')
        .exec();

    console.log(conductor)

    return conductor;
}



 async updateRutaAlternativa(id: string, estado: boolean): Promise<Ruta> {
    const updatedRuta = await this.rutaModel.findByIdAndUpdate(
      id,
      { estadoRutaAlternativa: estado },
      { new: true }
    ).exec();

    if (!updatedRuta) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }
    return updatedRuta;
  }



  async create(createRutaDto: CreateRutaDto): Promise<Ruta> {
    // Verificar si ya existe una ruta con el mismo nombre
    const existe = await this.rutaModel.findOne({ nombre: createRutaDto.nombre });
    if (existe) {
      throw new Error('Ya existe una ruta con ese nombre');
    }

    // Validar que al menos tenga ruta de ida
    if (!createRutaDto.rutaIda || createRutaDto.rutaIda.length === 0) {
      throw new Error('La ruta debe tener al menos un trayecto de ida');
    }

    // Validar que si tiene vuelta, tenga ruta de vuelta
    if (createRutaDto.tieneVuelta && (!createRutaDto.rutaVuelta || createRutaDto.rutaVuelta.length === 0)) {
      throw new Error('La ruta con vuelta debe tener definido el trayecto de vuelta');
    }

    // Validar que las rutas alternativas no sean arrays de arrays
    if (createRutaDto.rutaAlternativaIda && Array.isArray(createRutaDto.rutaAlternativaIda[0]?.latitud)) {
      throw new Error('La ruta alternativa de ida debe ser un array simple de coordenadas');
    }

    if (createRutaDto.rutaAlternativaVuelta && Array.isArray(createRutaDto.rutaAlternativaVuelta[0]?.latitud)) {
      throw new Error('La ruta alternativa de vuelta debe ser un array simple de coordenadas');
    }

    // Crear la nueva ruta con la estructura simplificada
    const nuevaRuta = new this.rutaModel({
      nombre: createRutaDto.nombre,
      rutaIda: createRutaDto.rutaIda,
      rutaVuelta: createRutaDto.rutaVuelta || [],
      paradas: createRutaDto.paradas || [],
      rutaAlternativaIda: createRutaDto.rutaAlternativaIda || [],
      rutaAlternativaVuelta: createRutaDto.rutaAlternativaVuelta || [],
      tieneVuelta: createRutaDto.tieneVuelta || false,
      deleted: false
    });

    return await nuevaRuta.save();
  }

  async findAll() {
    return await this.rutaModel.find({ deleted: false });
  }

  async update(id: string, updateRutaDto: any): Promise<Ruta> {
    // Verificar si se está cambiando el nombre y si ya existe
    if (updateRutaDto.nombre) {
      const existe = await this.rutaModel.findOne({
        nombre: updateRutaDto.nombre,
        _id: { $ne: id } // Excluir el documento actual
      });
      if (existe) {
        throw new Error('Ya existe una ruta con ese nombre');
      }
    }

    // Validaciones adicionales
    if (updateRutaDto.tieneVuelta && (!updateRutaDto.rutaVuelta || updateRutaDto.rutaVuelta.length === 0)) {
      throw new Error('La ruta con vuelta debe tener definido el trayecto de vuelta');
    }

    // Validar que las rutas alternativas no sean arrays de arrays
    if (updateRutaDto.rutaAlternativaIda && Array.isArray(updateRutaDto.rutaAlternativaIda[0]?.latitud)) {
      throw new Error('La ruta alternativa de ida debe ser un array simple de coordenadas');
    }

    if (updateRutaDto.rutaAlternativaVuelta && Array.isArray(updateRutaDto.rutaAlternativaVuelta[0]?.latitud)) {
      throw new Error('La ruta alternativa de vuelta debe ser un array simple de coordenadas');
    }

    // Preparar los datos a actualizar
    const updateData: any = { ...updateRutaDto };

    // Si se está desactivando la vuelta, limpiar la ruta de vuelta y su alternativa
    if (updateRutaDto.tieneVuelta === false) {
      updateData.rutaVuelta = [];
      updateData.rutaAlternativaVuelta = [];
    }

    const updatedRuta = await this.rutaModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    ).exec();

    if (!updatedRuta) {
      throw new NotFoundException(`Ruta no encontrada`);
    }

    return updatedRuta;
  }


  async remove(id: string) {
    const ruta = await this.rutaModel.findById(id);
    if (!ruta) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrado`);
    }
    ruta.deleted = true;
    ruta.save();

    return { message: 'Ruta eliminado (lógicamente)' };
  }


  async getJornada(id: string, fecha: string) {
    const fechaObj = new Date(fecha); // Ej: 2025-06-01

    // Calcular rango del mes en UTC
    const inicioMes = new Date(Date.UTC(fechaObj.getUTCFullYear(), fechaObj.getUTCMonth(), 1, 0, 0, 0, 0));
    const finMes = new Date(Date.UTC(fechaObj.getUTCFullYear(), fechaObj.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    const filtro = {
      fecha: {
        $gte: inicioMes,
        $lte: finMes
      },
      conductorId: id
    };
    const data = await this.jornadaModel.find(filtro)
      .populate({
        path: 'conductorId',
        select: 'nombre ci',
      })
      .populate({
        path: 'lineaId',
        select: 'nombre',
      })
      .exec();

    // Sumar las horas trabajadas
    const totalHorasTrabajadas = data.reduce((total, jornada) => {
      return total + (jornada.horasTrabajadas || 0);
    }, 0);

    return {
      jornadas: data,
      totalHorasTrabajadas
    };
  }

  async deleteMultipleAsignaciones(ids: string[]) {
    try {
      const result = await this.asignacionModel.deleteMany({
        _id: { $in: ids }
      }).exec();

      return {
        success: true,
        deletedCount: result.deletedCount,
        message: `${result.deletedCount} asignación(es) eliminada(s) correctamente`
      };
    } catch (error) {
      throw new Error(`Error al eliminar asignaciones: ${error.message}`);
    }
  }

  async updateAsignacion(id: string, data: any) {
    try {
      // 1. Primero obtener la asignación existente
      const asignacionExistente = await this.asignacionModel.findById(id).exec();

      if (!asignacionExistente) {
        throw new NotFoundException('Asignación no encontrada');
      }
      asignacionExistente.rutaId = data.rutaId._id

      asignacionExistente.save()
      return {
        success: true,
        data: asignacionExistente,
        message: 'Asignación actualizada correctamente'
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Error al actualizar asignación: ${error.message}`);
    }

  }


  async getReportsLineas(month: string, lineaId: string) {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new BadRequestException('Formato de mes inválido. Use YYYY-MM');
    }

    // Buscar la línea si se proporcionó un ID
    let linea = null;
    if (lineaId) {
      linea = await this.rutaModel.findById(lineaId).lean();
      if (!linea) {
        throw new NotFoundException('Línea no encontrada');
      }
    }

    // Construir el query para las asignaciones
    const query: any = {
      fecha: {
        $gte: new Date(`${month}-01`),
        $lt: new Date(dayjs(`${month}-01`).endOf('month').toISOString())
      }
    };

    if (lineaId) {
      query.rutaId = lineaId;
    }

    // Obtener las asignaciones
    const asignaciones = await this.asignacionModel.find(query)
      .populate('conductorId', 'nombre')
      .populate('rutaId', 'nombre')
      .lean();

    return {
      linea,
      asignaciones
    };

  }


}
