import { TestBed } from '@angular/core/testing';

import { MappingGuard } from './mapping.guard';

describe('MappingGuard', () => {
  let guard: MappingGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(MappingGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
