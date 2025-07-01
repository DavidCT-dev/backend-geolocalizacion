/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, unique: true })
  ci: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  telefono: string;

  @Prop({ required: false, default:null })
  password: string;

  @Prop({ default:false })
  state: boolean;

  @Prop({ required: false, default:null })
  avatar: string;

   @Prop({ required: false, default:null })
  vehiculo: string;

   @Prop({ required: false, default:null })
  matricula: string;

  @Prop({ default:false })
  deleted: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Role' })
  rol: mongoose.Schema.Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
