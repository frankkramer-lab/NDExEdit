import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MainInfoComponent} from './main-info.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {createTranslateLoader} from '../../app.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FontAwesomeTestingModule} from '@fortawesome/angular-fontawesome/testing';
import {By} from '@angular/platform-browser';

/**
 * Unit test: MainInfoComponent
 */
describe('MainInfoComponent', () => {
  /**
   * Component
   */
  let component: MainInfoComponent;
  /**
   * Fixture
   */
  let fixture: ComponentFixture<MainInfoComponent>;
  /**
   * DOM: Containing mailto link
   */
  let htmlMailto: HTMLElement;
  /**
   * DOM: Containing component title
   */
  let htmlMainInfoTitle: HTMLElement;

  /**
   * Setup
   */
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MainInfoComponent],
      imports: [
        FontAwesomeTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient]
          }
        })
      ]
    })
      .compileComponents();
  }));

  /**
   * Init
   */
  beforeEach(() => {
    fixture = TestBed.createComponent(MainInfoComponent);
    component = fixture.componentInstance;
    htmlMailto = fixture.debugElement.query(By.css('#mailto')).nativeElement;
    htmlMainInfoTitle = fixture.debugElement.query(By.css('#mainInfoTitle')).nativeElement;
    fixture.detectChanges();
  });

  /**
   * Test: Instance creation
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Test: Title
   */
  it('should have title', () => {
    expect(htmlMainInfoTitle.textContent).toEqual('MAIN_INFO_TITLE');
  });

  /**
   * Test: Mailto target
   */
  it('should have mailto link', () => {
    expect(htmlMailto.getAttribute('href')).toEqual('mailto:florian.auer@informatik.uni-augsburg.de');
  });
});
