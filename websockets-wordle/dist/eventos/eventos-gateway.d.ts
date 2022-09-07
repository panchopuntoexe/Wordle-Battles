import { Socket } from "socket.io";
declare enum EstadoDeLetra {
    INCORRECTA = 0,
    PARCIALMENTE_CORRECTA = 1,
    CORRECTA = 2,
    PENDIENTE = 3
}
export declare class EventosGateway {
    unirseSala(message: {
        salaId: string;
        nombre: string;
    }, socket: Socket): string;
    enviarParticipantes(message: {
        salaId: string;
        participantes: string[];
    }, socket: Socket): string;
    enviarIntento(message: {
        salaId: string;
        nombre: string;
        intento: EstadoDeLetra[];
    }, socket: Socket): string;
}
export {};
