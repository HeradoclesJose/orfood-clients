import { TestBed } from '@angular/core/testing';

import { DeliveryStatusService } from './delivery-status.service';

describe('DeliveryStatusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DeliveryStatusService = TestBed.get(DeliveryStatusService);
    expect(service).toBeTruthy();
  });
});
