import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {ElementRef, HostListener, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ConsultarPalabraService} from "../../servicios/consultar-palabra.service";

const
  TAMANIO_DE_PALABRA = 5;

const
  NUMERO_DE_INTENTOS = 6;

const
  LETRAS = (() => {
    // letter -> true. Easier to check.
    const ret: { [key: string]: boolean } = {};
    for (let charCode = 97; charCode < 97 + 26; charCode++) {
      ret[String.fromCharCode(charCode)] = true;
    }
    return ret;
  })();

interface Try {
  letras: Letra[];
}


interface Letra {
  texto: string;
  estado: EstadoDeLetra;
}

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
  selector: 'app-juego-enemigo',
  templateUrl: './juego-enemigo.component.html',
  styleUrls: ['./juego-enemigo.component.scss']
})

export class JuegoEnemigoComponent implements OnInit, OnChanges{
  @ViewChildren('tryContainer') tryContainers!: QueryList<ElementRef>;

  ngOnInit(): void {
    console.log("Nombre de usuario: ",this.nombreDeUsuario);
  }

  readonly intentos: Try[] = [];

  readonly estadoDeLetra = EstadoDeLetra;

  readonly estadoDeLetrasActual: { [key: string]: EstadoDeLetra } = {};

  mensajeEnPanel = '';

  fadeOutInfoMessage = false;

  mostrarContenedorDeMensajeFinal = false;
  mostrarDialogoDeMensajeFinal = false;

  private numeroDeIntentosEnviados = 0;

  private ganoElJuego = false;

  constructor(
    private readonly consultarPalabraServicio: ConsultarPalabraService
  ) {

    for (let i = 0; i < NUMERO_DE_INTENTOS; i++) {
      const letras: Letra[] = [];
      for (let j = 0; j < TAMANIO_DE_PALABRA; j++) {
        letras.push({texto: '', estado: EstadoDeLetra.PENDIENTE});
      }
      this.intentos.push({letras: letras});
    }

  }

  @Input()
  nombreDeUsuario="BRAH"

  @Input()
  intento:EstadoDeLetra[]=[0,0,0,0,0]

  ngOnChanges() {
    this.setEstados(this.intento)
  }

  refrescar() {
    window.location.reload();
  }


  public async setEstados(estados: EstadoDeLetra[]){
    const intentoActual = this.intentos[this.numeroDeIntentosEnviados];
    console.log("Estados de enemigo ", estados);
    console.log("Intentos de enemigo ",  this.numeroDeIntentosEnviados);

    const tryContainer = this.tryContainers.get(this.numeroDeIntentosEnviados)?.nativeElement as HTMLElement;

    const elementosDeLetras = tryContainer.querySelectorAll('.letter-container');
    for (let i = 0; i < elementosDeLetras.length; i++) {

      const curLetterEle = elementosDeLetras[i];
      curLetterEle.classList.add('fold');
      await this.wait(180);
      intentoActual.letras[i].estado = estados[i];
      curLetterEle.classList.remove('fold');
      await this.wait(180);
    }

    this.numeroDeIntentosEnviados++;


    if (estados.every(state => state === EstadoDeLetra.CORRECTA)) {

      this.ganoElJuego = true;

      for (let i = 0; i < elementosDeLetras.length; i++) {
        const curLetterEle = elementosDeLetras[i];
        curLetterEle.classList.add('bounce');
        await this.wait(160);
      }
      this.mostrarMensajeFinal();
      return;
    }

  }
  private async wait(ms: number) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    })
  }

  private mostrarMensajeFinal() {
    setTimeout(() => {
      this.mostrarContenedorDeMensajeFinal = true;

      setTimeout(() => {

        this.mostrarDialogoDeMensajeFinal = true;
      });
    }, 1500);
  }
}
