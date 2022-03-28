import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarEditPropertyComponent } from './sidebar-edit-property.component';

describe('SidebarEditPropertyComponent', () => {
  let component: SidebarEditPropertyComponent;
  let fixture: ComponentFixture<SidebarEditPropertyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarEditPropertyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarEditPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
