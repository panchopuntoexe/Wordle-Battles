import {Injectable} from "@angular/core";
import {Socket} from "ngx-socket-io";
import {Observable} from "rxjs";

enum EstadoDeLetra {

  INCORRECTA,
  // correcta pero no en posición
  PARCIALMENTE_CORRECTA,
  // correcta y en posición
  CORRECTA,
  // antes de que el intento actual sea enviado
  PENDIENTE,
}

@Injectable({
  providedIn: 'root'
})

export class WebsocketsService {
  constructor(private socket: Socket) {
  }


  ejecutarEventoUnirseSala(salaId: number, nombre: string) {
    this.socket.emit(
      'unirseSala', {
        salaId,
        nombre
      });
  }

  escucharEventoUnirseSala() {
    return this
      .socket
      .fromEvent('escucharEventoUnirseSala');
  }

  ejecutarEventoEnviarParticipantes(salaId: number, participantes: string[]) {
    this.socket.emit(
      'enviarParticipantes', {
        salaId,
        participantes
      });
  }

  escucharEventoEnviarParticipantes() {
    return this
      .socket
      .fromEvent('escucharEventoEnviarParticipantes');
  }

  ejecutarEventoEnviarIntento(salaId: number,
                              nombre: string,
                              intento: EstadoDeLetra[]) {
    this.socket.emit(
      'enviarIntento', {
        salaId,
        nombre,
        intento
      });
  }

  escucharEventoEnviarIntento() {
    return this
      .socket
      .fromEvent('escucharEventoEnviarIntento');
  }
}
