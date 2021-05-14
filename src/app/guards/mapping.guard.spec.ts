import { TestBed } from '@angular/core/testing';

import { MappingGuard } from './mapping.guard';
import {RouterTestingModule} from '@angular/router/testing';

describe('MappingGuard', () => {
  let guard: MappingGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      providers: []
    });
    guard = TestBed.inject(MappingGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
