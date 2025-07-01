/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type ConfigurationApkDocument = HydratedDocument<ConfigurationApk>;

@Schema({ timestamps: true })
export class ConfigurationApk {

  @Prop({ required: true, default:false })
  mostrar_parada: boolean;

  @Prop({ required: true,default:false })
  registro_viaje: boolean;


  @Prop({ default:false })
  deleted: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId;
}

export const ConfigurationApkSchema = SchemaFactory.createForClass(ConfigurationApk);
