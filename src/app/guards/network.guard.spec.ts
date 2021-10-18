import {TestBed} from '@angular/core/testing';

import {NetworkGuard} from './network.guard';
import {RouterTestingModule} from '@angular/router/testing';

describe('NetworkGuard', () => {
  let guard: NetworkGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ]
    });
    guard = TestBed.inject(NetworkGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
