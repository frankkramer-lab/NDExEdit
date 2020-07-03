import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarEditComponent } from './sidebar-edit.component';

describe('SidebarEditComponent', () => {
  let component: SidebarEditComponent;
  let fixture: ComponentFixture<SidebarEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
