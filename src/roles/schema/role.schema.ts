import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type RoleDocument = HydratedDocument<Role>;


@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  nombre: string;

   // Array de IDs de permisos referenciados
  @Prop({ type: [Types.ObjectId], ref: 'Permiso', default: [] })
  permisoIds: Types.ObjectId[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);