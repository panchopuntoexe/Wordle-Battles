import { TestBed } from '@angular/core/testing';

import { ConsultarPalabraService } from './consultar-palabra.service';

describe('ConsultarPalabraService', () => {
  let service: ConsultarPalabraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsultarPalabraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
