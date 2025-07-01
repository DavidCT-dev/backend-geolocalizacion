import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type JornadaDocument = HydratedDocument<Jornada>;

@Schema({ timestamps: true })
export class Jornada {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  conductorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Ruta', required: true })
  lineaId: Types.ObjectId;

  @Prop({ type: Date, required: true }) 
  fecha: Date;

  @Prop({ 
    type: String, 
    enum: ['activa', 'pausada', 'inactiva'],
    default: 'activa'
  })
  estado: string;

  @Prop({ type: Date })
  inicio: Date;

  @Prop({ type: Number, default: 0 })
  horasTrabajadas: number;
  

  @Prop({ type: Number, default: 0 })
  numeroVueltas: number;

    @Prop({ type: Date })
  hora_inicio: Date;

  @Prop({ type: Date })
  hora_fin: Date;
}

export const JornadaSchema = SchemaFactory.createForClass(Jornada);