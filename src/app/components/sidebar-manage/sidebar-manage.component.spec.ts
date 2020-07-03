import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarManageComponent } from './sidebar-manage.component';

describe('SidebarManageComponent', () => {
  let component: SidebarManageComponent;
  let fixture: ComponentFixture<SidebarManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
