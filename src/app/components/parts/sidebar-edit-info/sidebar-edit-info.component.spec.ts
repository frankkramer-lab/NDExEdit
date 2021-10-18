import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SidebarEditInfoComponent} from './sidebar-edit-info.component';

describe('SidebarEditInfoComponent', () => {
  let component: SidebarEditInfoComponent;
  let fixture: ComponentFixture<SidebarEditInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarEditInfoComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarEditInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
