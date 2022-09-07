import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {WebsocketsService} from "../../servicios/websockets/websockets.service";
import {Subscription} from "rxjs";

enum EstadoDeLetra {
  INCORRECTA,
  // correcta pero no en posición
  PARCIALMENTE_CORRECTA,
  // correcta y en posición
  CORRECTA,
  // antes de que el intento actual sea enviado
  PENDIENTE,
}

@Component({
  selector: 'app-sala',
  templateUrl: './sala.component.html',
  styleUrls: ['./sala.component.scss']
})
export class SalaComponent implements OnInit {

  arregloEnemigos: { intento: EstadoDeLetra[], nombre: string }[] = []

  private salaId: string = "";
  nombre: string = "";
  arregloSuscripciones: Subscription[] = [];

  constructor(
    public readonly activatedRoute: ActivatedRoute,
    public readonly websocketsService: WebsocketsService
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute
      .params
      .subscribe(
        {
          next: (parametrosDeRuta) => {
            const salaId = parametrosDeRuta['salaId'];
            const nombre = parametrosDeRuta['nombre'];
            this.nombre = nombre;
            this.salaId = salaId;
            this.logicaSalas(this.salaId, this.nombre)
          }
        }
      )
  }


  recibirMensajeDeIntento($event: any) {
    this.websocketsService.ejecutarEventoEnviarIntento(+this.salaId, this.nombre, $event as EstadoDeLetra[]);
  }

  enviarParticipantes(nombreNuevoParticipante: string) {
    let participantes: string[] = []
    participantes.push(this.nombre)
    this.arregloEnemigos.forEach(function (value) {
      //envio participantes menos el nuevo participante
      if (value.nombre != nombreNuevoParticipante) {
        participantes.push(value.nombre)
      }
    })
    this.websocketsService.ejecutarEventoEnviarParticipantes(+this.salaId, participantes);
  }

  logicaSalas(salaId: string, nombre: string) {
    this.desSuscribirse();
    const respEscucharEventoIntento =
      this.websocketsService.escucharEventoEnviarIntento()
        .subscribe({
          next: (data: any) => {
            this.arregloEnemigos.forEach(function (value) {
              if (value.nombre == data.nombre) {
                value.intento = Object.assign([], data.intento)
              }
            })
          },
          error: (error) => {
            console.error({error})
          }
        });

    const respEscucharEventoUnirseSala =
      this.websocketsService.escucharEventoUnirseSala()
        .subscribe({
          next: (data: any) => {
            this.arregloEnemigos.push({
              intento: [0, 0, 0, 0, 0],
              nombre: data.nombre
            })
            this.enviarParticipantes(data.nombre)
          },
          error: (error) => {
            console.error({error})
          }
        });

    const respEscucharEventoEnviarParticipantes =
      this.websocketsService.escucharEventoEnviarParticipantes()
        .subscribe({
          next: (data: any) => {
            let auxArregloDeNombres = this.arregloEnemigos.map(value => value.nombre)
            let participantesNuevos = data.participantes.filter((item: string) => auxArregloDeNombres.indexOf(item) < 0);
            //verifico si tiene algo
            if (participantesNuevos.length != 0) {
              participantesNuevos.forEach((value: any) => {
                if (value != this.nombre) {
                  this.arregloEnemigos.push({
                    intento: [0, 0, 0, 0, 0],
                    nombre: value
                  })
                }
              })
            }
          },
          error: (error) => {
            console.error({error})
          }
        });

    this.arregloSuscripciones.push(respEscucharEventoIntento)
    this.arregloSuscripciones.push(respEscucharEventoUnirseSala)
    this.arregloSuscripciones.push(respEscucharEventoEnviarParticipantes)
    this.websocketsService.ejecutarEventoUnirseSala(+this.salaId, this.nombre)
  }

  desSuscribirse() {
    this.arregloSuscripciones.forEach(
      (suscripcion: Subscription) => {
        suscripcion.unsubscribe();
      }
    )
  }
}
