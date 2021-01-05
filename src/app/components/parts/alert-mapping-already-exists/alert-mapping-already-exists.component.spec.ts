import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertMappingAlreadyExistsComponent } from './alert-mapping-already-exists.component';

describe('AlertMappingAlreadyExistsComponent', () => {
  let component: AlertMappingAlreadyExistsComponent;
  let fixture: ComponentFixture<AlertMappingAlreadyExistsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertMappingAlreadyExistsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertMappingAlreadyExistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
