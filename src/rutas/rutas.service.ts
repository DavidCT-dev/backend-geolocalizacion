import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { AsignacionDto } from './dto/create-asignacion.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Ruta, RutaDocument } from './schema/ruta.schema';
import { Model } from 'mongoose';
import { Asignacion, AsignacionDocument } from './schema/asignacion.schema';
import { Jornada, JornadaDocument } from 'src/jornada/schema/jornada.schema';

@Injectable()
export class RutasService {
  constructor(
    @InjectModel(Ruta.name) private rutaModel: Model<RutaDocument>,
    @InjectModel(Asignacion.name) private asignacionModel: Model<AsignacionDocument>,
    @InjectModel(Jornada.name) private jornadaModel: Model<JornadaDocument>
  ) { }



  async asignarMultiples(asignacionesDto: any[]) {
    const resultados = [];
    const asignacionesCreadas = [];
    for (const asignacionDto of asignacionesDto) {
      // Verificar si ya existe
      const existe = await this.asignacionModel.findOne({
        conductorId: asignacionDto.conductorId,
        rutaId: asignacionDto.rutaId,
        fecha: asignacionDto.fecha
      });

      //para la misma fecha no se le puede asignar 2 lineas



      if (!existe) {
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
          message: 'Asignación ya existente',
          data: existe
        });
      }
    }

    return {
      total: asignacionesDto.length,
      creadas: asignacionesCreadas.length,
      existentes: asignacionesDto.length - asignacionesCreadas.length,
      detalles: resultados
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
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;

    // Normalizar a inicio del día en UTC
    const inicioDelDia = new Date(Date.UTC(
      fechaObj.getUTCFullYear(),
      fechaObj.getUTCMonth(),
      fechaObj.getUTCDate(),
      0, 0, 0, 0
    ));

    // Fin del día en UTC
    const finDelDia = new Date(Date.UTC(
      fechaObj.getUTCFullYear(),
      fechaObj.getUTCMonth(),
      fechaObj.getUTCDate(),
      23, 59, 59, 999
    ));

    const filtro = {
      fecha: { $gte: inicioDelDia, $lte: finDelDia },
      conductorId,
    };

    return await this.asignacionModel.findOne(filtro)
      .populate('conductorId', 'nombre ci')
      .populate('rutaId', 'nombre rutas paradas')
      .exec();
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







}
