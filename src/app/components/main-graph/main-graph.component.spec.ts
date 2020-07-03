import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainGraphComponent } from './main-graph.component';

describe('MainGraphComponent', () => {
  let component: MainGraphComponent;
  let fixture: ComponentFixture<MainGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
