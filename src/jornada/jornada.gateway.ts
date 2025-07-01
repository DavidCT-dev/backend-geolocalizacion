import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, OnGatewayInit, ConnectedSocket } from '@nestjs/websockets';
import { JornadaService } from './jornada.service';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', 
  },
})
export class JornadaGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly jornadaService: JornadaService
  ) { }

  afterInit(server: any) {
    // console.log('se ejecuta cuando inicia')
  }

  handleConnection(client: any) {
    // console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: any) {
    // console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('unirse_sala')
  handleUnirseSala(
    @MessageBody() data: { salaId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Dejar todas las salas anteriores
    const rooms = Array.from(client.rooms);
    rooms.forEach(room => {
      if (room !== client.id) {
        client.leave(room);
      }
    });
    console.log(rooms)
    // Unirse a la nueva sala
    client.join(data.salaId);
    return { event: 'unido_a_sala', salaId: data.salaId };
  }

  @SubscribeMessage('ubicacion')
  async handleUbicacion(
    @MessageBody() createJornadaDto: any,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    const { salaId, conductorId, lineaId, latitud, longitud, estado } = createJornadaDto;

    console.log('Datos recibidos:', createJornadaDto);

    // Validación básica
    if (!salaId || !conductorId || !lineaId || latitud === undefined || longitud === undefined) {
      this.server.to(`linea_${lineaId}`).emit('ubicacion_actual', {estado});

      console.error('Datos incompletos recibidos:', createJornadaDto);
      return { event: 'error', message: 'Datos incompletos' };
    }

    try {
      // Unir al conductor a la sala de su línea
      client.join(`linea_${lineaId}`);
      console.log(`Conductor ${conductorId} unido a sala linea_${lineaId}`);

      // Guardar ubicación en base de datos
      const result = await this.jornadaService.create(createJornadaDto);
      console.log('Ubicación guardada en BD:', result);

      // Preparar datos para emitir
      const datosEmision = {
        ...result,
        conductorId,
        lineaId,
        timestamp: new Date().toISOString(),
        estado
      };

      // Emitir a la sala específica de la línea
      this.server.to(`linea_${lineaId}`).emit('ubicacion_actual', datosEmision);
      console.log(`Emitiendo a sala linea_${lineaId}:`, datosEmision);

      return { event: 'ubicacion_actualizada', data: result };
    } catch (error) {
      console.error('Error en handleUbicacion:', error);
      return { event: 'error', message: 'Error al procesar ubicación' };
    }
  }

  @SubscribeMessage('findAllJornada')
  findAll() {
    return this.jornadaService.findAll();
  }

  @SubscribeMessage('findOneJornada')
  findOne(@MessageBody() id: number) {
    return this.jornadaService.findOne(id);
  }

  @SubscribeMessage('updateJornada')
  update(@MessageBody() updateJornadaDto: any) {
    return this.jornadaService.update(updateJornadaDto.id, updateJornadaDto);
  }

  @SubscribeMessage('removeJornada')
  remove(@MessageBody() id: number) {
    return this.jornadaService.remove(id);
  }
}
