import { TestBed } from '@angular/core/testing';

import { ExitEditingGuard } from './exit-editing.guard';

describe('ExitEditingGuard', () => {
  let guard: ExitEditingGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ExitEditingGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
