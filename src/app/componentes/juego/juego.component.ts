import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ElementRef, HostListener, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {PALABRAS} from '../../../assets/diccionario';
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
  selector: 'app-juego',
  templateUrl: './juego.component.html',
  styleUrls: ['./juego.component.scss']
})
export class JuegoComponent implements OnInit {
  @ViewChildren('tryContainer') tryContainers!: QueryList<ElementRef>;


  ngOnInit(): void {
  }

  @Output()
  mensajeDeIntento = new EventEmitter<EstadoDeLetra[]>();

  enviarMensajeDeIntento(estados: EstadoDeLetra[]) {
    this.mensajeDeIntento.emit(estados)
  }

  readonly intentos: Try[] = [];

  readonly estadoDeLetra = EstadoDeLetra;

  readonly keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['Enviar', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Borrar'],
  ];

  readonly estadoDeLetrasActual: { [key: string]: EstadoDeLetra } = {};

  mensajeEnPanel = '';

  fadeOutInfoMessage = false;

  mostrarContenedorDeMensajeFinal = false;
  mostrarDialogoDeMensajeFinal = false;

  private indiceDeLetraActual = 0;


  private numeroDeIntentosEnviados = 0;


  private palabraResultado = '';


  private ganoElJuego = false;


  private cuentaDeLetrasDePalabraResultado: { [letter: string]: number } = {};

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


    const numeroDePalabras = PALABRAS.length;


    this.palabraResultado=consultarPalabraServicio.consultarPalabra()

    console.log('Resultado: ', this.palabraResultado);

    for (const letra of this.palabraResultado) {
      const count = this.cuentaDeLetrasDePalabraResultado[letra];
      if (count == null) {
        this.cuentaDeLetrasDePalabraResultado[letra] = 0;
      }
      this.cuentaDeLetrasDePalabraResultado[letra]++;
    }
    console.log(this.cuentaDeLetrasDePalabraResultado);
  }

  @HostListener('document:keydown', ['$event'])
  gestionarEventoDeTeclado(event: KeyboardEvent) {
    this.gestionarPulsoDeTecla(event.key);
  }


  getKeyClass(tecla: string): string {
    const estado = this.estadoDeLetrasActual[tecla.toLowerCase()];
    switch (estado) {
      case EstadoDeLetra.CORRECTA:
        return 'match key';
      case EstadoDeLetra.PARCIALMENTE_CORRECTA:
        return 'partial key';
      case EstadoDeLetra.INCORRECTA:
        return 'wrong key';
      default:
        return 'key';
    }
  }

  gestionarPulsoDeTecla(tecla: string) {
    if (this.ganoElJuego) {
      return;
    }


    if (LETRAS[tecla.toLowerCase()]) {

      if (this.indiceDeLetraActual < (this.numeroDeIntentosEnviados + 1) * TAMANIO_DE_PALABRA) {
        this.setLetra(tecla);
        this.indiceDeLetraActual++;
      }
    }

    else if (tecla === 'Backspace') {

      if (this.indiceDeLetraActual > this.numeroDeIntentosEnviados * TAMANIO_DE_PALABRA) {
        this.indiceDeLetraActual--;
        this.setLetra('');
      }
    }

    else if (tecla === 'Enter') {
      this.verificarIntento();
    }
  }

  refrescar() {
    window.location.reload();
  }

  private setLetra(letter: string) {
    const indiceDeIntento = Math.floor(this.indiceDeLetraActual / TAMANIO_DE_PALABRA);
    const indiceDeLetra = this.indiceDeLetraActual - indiceDeIntento * TAMANIO_DE_PALABRA;
    this.intentos[indiceDeIntento].letras[indiceDeLetra].texto = letter;
  }

  private async verificarIntento() {

    const intentoActual = this.intentos[this.numeroDeIntentosEnviados];
    if (intentoActual.letras.some(letter => letter.texto === '')) {
      this.mostrarMensaje('Not enough letters');
      return;
    }


    const palabraDelActualIntento = intentoActual.letras.map(letter => letter.texto).join('').toUpperCase();
    console.log(palabraDelActualIntento.toLowerCase())
    if (!PALABRAS.includes(palabraDelActualIntento.toLowerCase())) {
      this.mostrarMensaje('Esta palabra no existe');

      const containerDeIntento = this.tryContainers.get(this.numeroDeIntentosEnviados)?.nativeElement as HTMLElement;
      containerDeIntento.classList.add('shake');
      setTimeout(() => {
        containerDeIntento.classList.remove('shake');
      }, 500);
      return;
    }

    const cuentaDeLetrasDePalabraResultadoAux = {...this.cuentaDeLetrasDePalabraResultado};
    const estados: EstadoDeLetra[] = [];
    for (let i = 0; i < TAMANIO_DE_PALABRA; i++) {
      const letraEsperada = this.palabraResultado[i];
      const letraActual = intentoActual.letras[i].texto.toLowerCase();
      let estado = EstadoDeLetra.INCORRECTA;

      if (letraEsperada === letraActual && cuentaDeLetrasDePalabraResultadoAux[letraActual] > 0) {
        cuentaDeLetrasDePalabraResultadoAux[letraEsperada]--;
        estado = EstadoDeLetra.CORRECTA;
      } else if (
        this.palabraResultado.includes(letraActual) && cuentaDeLetrasDePalabraResultadoAux[letraActual] > 0) {
        cuentaDeLetrasDePalabraResultadoAux[letraActual]--
        estado = EstadoDeLetra.PARCIALMENTE_CORRECTA;
      }
      estados.push(estado);
    }
    console.log("estados", estados);
    this.enviarMensajeDeIntento(estados)


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

    for (let i = 0; i < TAMANIO_DE_PALABRA; i++) {
      const curLetter = intentoActual.letras[i];
      const got = curLetter.texto.toLowerCase();
      const curStoredState = this.estadoDeLetrasActual[got];
      const targetState = estados[i];

      if (curStoredState == null || targetState > curStoredState) {
        this.estadoDeLetrasActual[got] = targetState;
      }
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

    if (this.numeroDeIntentosEnviados === NUMERO_DE_INTENTOS) {
      // Don't hide it.
      this.mostrarMensaje(this.palabraResultado.toUpperCase(), false);
      this.mostrarMensajeFinal();
    }
  }

  private mostrarMensaje(msg: string, hide = true) {
    this.mensajeEnPanel = msg;
    if (hide) {
      setTimeout(() => {
        this.fadeOutInfoMessage = true;
        setTimeout(() => {
          this.mensajeEnPanel = '';
          this.fadeOutInfoMessage = false;
        }, 500);
      }, 2000);
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
