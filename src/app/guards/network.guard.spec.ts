import { TestBed } from '@angular/core/testing';

import { NetworkGuard } from './network.guard';

describe('NetworkGuard', () => {
  let guard: NetworkGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NetworkGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
