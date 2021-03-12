import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SidebarCompareComponent} from './sidebar-compare.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {createTranslateLoader} from '../../app.module';
import {HttpClient} from '@angular/common/http';

describe('SidebarCompareComponent', () => {
  let component: SidebarCompareComponent;
  let fixture: ComponentFixture<SidebarCompareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarCompareComponent],
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient]
          }
        })
      ],
      providers: []
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
