import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JuegoEnemigoComponent } from './juego-enemigo.component';

describe('JuegoEnemigoComponent', () => {
  let component: JuegoEnemigoComponent;
  let fixture: ComponentFixture<JuegoEnemigoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JuegoEnemigoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JuegoEnemigoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
