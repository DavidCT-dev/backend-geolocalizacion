import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AsignacionDocument = HydratedDocument<Asignacion>;

@Schema({ timestamps: true })
export class Asignacion {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  conductorId: Types.ObjectId; 

  @Prop({ type: Types.ObjectId, ref: 'Ruta', required: true })
  rutaId: Types.ObjectId; // Referencia a la línea

  @Prop({ required: true })
  fecha: Date; // Fecha de asignación

}

export const AsignacionSchema = SchemaFactory.createForClass(Asignacion);