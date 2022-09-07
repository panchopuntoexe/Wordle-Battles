import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {JuegoComponent} from "./componentes/juego/juego.component";
import {SalaComponent} from "./componentes/sala/sala.component";

const routes: Routes = [
  {
    path: 'sala/:salaId/:nombre',
    component: SalaComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
