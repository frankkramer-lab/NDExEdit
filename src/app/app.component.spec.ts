import {async, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {AppComponent} from './app.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {createTranslateLoader} from './app.module';
import {HttpClient} from '@angular/common/http';
import {DataService} from './services/data.service';
import {UtilityService} from './services/utility.service';
import {ParseService} from './services/parse.service';
import {LayoutService} from './services/layout.service';
import {FontAwesomeTestingModule} from '@fortawesome/angular-fontawesome/testing';

class MockDataService {}
class MockUtilityService {}
class MockLayoutService {}
class MockParseService {}

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient]
          }
        }),
        FontAwesomeTestingModule
      ],
      providers: [],
      declarations: [
        AppComponent
      ],
    })
      .overrideComponent(AppComponent, {
        set: {
          providers: [
            {provide: DataService, useClass: MockDataService},
            {provide: UtilityService, useClass: MockUtilityService},
            {provide: ParseService, useClass: MockParseService},
            {provide: LayoutService, useClass: MockLayoutService},
          ]
        }
      })
      .compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'NDExEdit'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('NDExEdit');
  });
});
