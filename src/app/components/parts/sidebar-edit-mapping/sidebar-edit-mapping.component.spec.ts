import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SidebarEditMappingComponent} from './sidebar-edit-mapping.component';

describe('SidebarEditMappingComponent', () => {
  let component: SidebarEditMappingComponent;
  let fixture: ComponentFixture<SidebarEditMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarEditMappingComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarEditMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
