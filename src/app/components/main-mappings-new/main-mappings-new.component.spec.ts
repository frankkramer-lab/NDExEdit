import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MainMappingsNewComponent} from './main-mappings-new.component';

describe('MainMappingsNewComponent', () => {
  let component: MainMappingsNewComponent;
  let fixture: ComponentFixture<MainMappingsNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MainMappingsNewComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainMappingsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
