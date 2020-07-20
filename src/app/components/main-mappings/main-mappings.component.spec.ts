import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainMappingsComponent } from './main-mappings.component';

describe('MainMappingsComponent', () => {
  let component: MainMappingsComponent;
  let fixture: ComponentFixture<MainMappingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainMappingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainMappingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
