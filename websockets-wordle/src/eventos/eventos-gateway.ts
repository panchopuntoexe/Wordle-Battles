import {ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway} from "@nestjs/websockets";
import {Server, Socket} from "socket.io";

enum EstadoDeLetra {

    INCORRECTA,
    // correcta pero no en posición
    PARCIALMENTE_CORRECTA,
    // correcta y en posición
    CORRECTA,
    // antes de que el intento actual sea enviado
    PENDIENTE,
}

@WebSocketGateway(
    8080,
    {
        cors: {
            origin: '*',
        }
    })

export class EventosGateway {


    @SubscribeMessage('unirseSala')
    unirseSala(
        @MessageBody()
            message: { salaId: string, nombre: string },
        @ConnectedSocket()
            socket: Socket
    ) {
        socket.join(message.salaId);

        const mensaje = {
            nombre: message.nombre
        };
        socket.broadcast
            .to(message.salaId)
            .emit( 'escucharEventoUnirseSala', mensaje);
        return 'ok';
    }

    @SubscribeMessage('enviarParticipantes')
    enviarParticipantes(
        @MessageBody()
            message: { salaId: string, participantes: string[] },
        @ConnectedSocket()
            socket: Socket
    ) {
        const mensaje = {
            participantes: message.participantes
        };
        socket.broadcast.to(message.salaId).emit('escucharEventoEnviarParticipantes', mensaje);
        return 'ok';
    }

    @SubscribeMessage('enviarIntento')
    enviarIntento(
        @MessageBody()
            message: { salaId: string, nombre: string, intento: EstadoDeLetra[] },
        @ConnectedSocket()
            socket: Socket
    ) {
        const mensaje = {
            nombre: message.nombre,
            intento: message.intento
        };
        socket.broadcast.to(message.salaId).emit('escucharEventoEnviarIntento', mensaje);
        return 'ok';
    }
}
