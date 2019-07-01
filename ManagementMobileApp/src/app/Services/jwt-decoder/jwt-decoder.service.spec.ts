import { TestBed } from '@angular/core/testing';

import { JwtDecoderService } from './jwt-decoder.service';

describe('JwtDecoderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JwtDecoderService = TestBed.get(JwtDecoderService);
    expect(service).toBeTruthy();
  });
});
