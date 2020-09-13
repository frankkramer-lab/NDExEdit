import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SidebarCompareComponent} from './sidebar-compare.component';

describe('SidebarCompareComponent', () => {
  let component: SidebarCompareComponent;
  let fixture: ComponentFixture<SidebarCompareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarCompareComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
