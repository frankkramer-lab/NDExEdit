import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SidebarEditMappingDiscreteComponent} from './sidebar-edit-mapping-discrete.component';

describe('SidebarEditMappingDiscreteComponent', () => {
  let component: SidebarEditMappingDiscreteComponent;
  let fixture: ComponentFixture<SidebarEditMappingDiscreteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarEditMappingDiscreteComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarEditMappingDiscreteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
