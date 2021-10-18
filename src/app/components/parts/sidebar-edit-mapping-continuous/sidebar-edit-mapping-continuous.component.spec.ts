import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SidebarEditMappingContinuousComponent} from './sidebar-edit-mapping-continuous.component';

describe('SidebarEditMappingContinuousComponent', () => {
  let component: SidebarEditMappingContinuousComponent;
  let fixture: ComponentFixture<SidebarEditMappingContinuousComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarEditMappingContinuousComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarEditMappingContinuousComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
