import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PermisoDocument = HydratedDocument<Permiso>;


@Schema({ timestamps: true })
export class Permiso {
  @Prop({ required: true, unique: true })
  nombre: string;
}

export const PermisoSchema = SchemaFactory.createForClass(Permiso);