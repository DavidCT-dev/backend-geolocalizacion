import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RutaDocument = HydratedDocument<Ruta>;

class CoordenadaRuta {
  @Prop({ required: true })
  latitud: number;

  @Prop({ required: true })
  longitud: number;
}

class CoordenadaParada {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  latitud: number;

  @Prop({ required: true })
  longitud: number;
}

@Schema({ timestamps: true })
export class Ruta {
  @Prop({ required: true, unique: true })
  nombre: string;

  // Ruta principal de ida
  @Prop({ type: [CoordenadaRuta], default: [] })
  rutaIda: CoordenadaRuta[];

  // Ruta principal de vuelta
  @Prop({ type: [CoordenadaRuta], default: [] })
  rutaVuelta: CoordenadaRuta[];

  // Paradas comunes (pueden usarse en ambas direcciones)
  @Prop({ type: [CoordenadaParada], default: [] })
  paradas: CoordenadaParada[];

  // Ruta alternativa de ida (ahora es un solo array, no array de arrays)
  @Prop({ type: [CoordenadaRuta], default: [] })
  rutaAlternativaIda: CoordenadaRuta[];

  // Ruta alternativa de vuelta (ahora es un solo array, no array de arrays)
  @Prop({ type: [CoordenadaRuta], default: [] })
  rutaAlternativaVuelta: CoordenadaRuta[];

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ default: false })
  tieneVuelta: boolean;
}

export const RutaSchema = SchemaFactory.createForClass(Ruta);