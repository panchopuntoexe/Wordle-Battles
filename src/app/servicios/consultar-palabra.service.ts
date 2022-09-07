import { Injectable } from '@angular/core';
import {PALABRAS} from '../../assets/diccionario';

@Injectable({
  providedIn: 'root'
})
export class ConsultarPalabraService {

  constructor() { }


  consultarPalabra(){
    return PALABRAS[7].toLowerCase();
  }
}
