import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SidebarEditAddCollectionComponent} from './sidebar-edit-add-collection.component';

describe('SidebarEditAddCollectionComponent', () => {
  let component: SidebarEditAddCollectionComponent;
  let fixture: ComponentFixture<SidebarEditAddCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarEditAddCollectionComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarEditAddCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
