/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type RegistroPasajerosDocument = HydratedDocument<RegistroPasajeros>;

@Schema({ timestamps: true })
export class RegistroPasajeros {


  @Prop({ required: true,})
  fecha: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  conductorId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Ruta', required: true })
  lineaId: mongoose.Schema.Types.ObjectId;

  @Prop({ default:false })
  deleted: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId;
}

export const RegistroPasajerosSchema = SchemaFactory.createForClass(RegistroPasajeros);
