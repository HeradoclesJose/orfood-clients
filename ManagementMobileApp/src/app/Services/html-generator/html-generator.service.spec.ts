import { TestBed } from '@angular/core/testing';

import { HtmlGeneratorService } from './html-generator.service';

describe('HtmlGeneratorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HtmlGeneratorService = TestBed.get(HtmlGeneratorService);
    expect(service).toBeTruthy();
  });
});
