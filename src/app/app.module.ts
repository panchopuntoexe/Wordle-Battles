import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {JuegoComponent} from "./componentes/juego/juego.component";
import { JuegoEnemigoComponent } from './componentes/juego-enemigo/juego-enemigo.component';
import {SocketIoModule} from "ngx-socket-io";
import { SalaComponent } from './componentes/sala/sala.component';

@NgModule({
  declarations: [
    AppComponent,
    JuegoComponent,
    JuegoEnemigoComponent,
    SalaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SocketIoModule.forRoot({
      url:'ws://localhost:8080',
      options:{}
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
