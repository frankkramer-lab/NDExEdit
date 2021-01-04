import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MainMappingsAvailableAttributesComponent} from './main-mappings-available-attributes.component';

describe('MainMappingsAvailableAttributesComponent', () => {
  let component: MainMappingsAvailableAttributesComponent;
  let fixture: ComponentFixture<MainMappingsAvailableAttributesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MainMappingsAvailableAttributesComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainMappingsAvailableAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
