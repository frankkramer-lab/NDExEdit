import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainMappingsNewFormComponent } from './main-mappings-new-form.component';

describe('MainMappingsNewFormComponent', () => {
  let component: MainMappingsNewFormComponent;
  let fixture: ComponentFixture<MainMappingsNewFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainMappingsNewFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainMappingsNewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
