import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DragbarComponent} from './dragbar.component';

describe('DragbarComponent', () => {
  let component: DragbarComponent;
  let fixture: ComponentFixture<DragbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DragbarComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DragbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
