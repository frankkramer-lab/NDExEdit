import {async, fakeAsync, TestBed, tick} from '@angular/core/testing';
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
import {Router} from '@angular/router';
import {routes} from './app-routing.module';
import {Location} from '@angular/common';

class MockDataService {
  selectNetwork = jasmine.createSpy('selectNetwork').and.callFake(() => {
  });
}

class MockUtilityService {
}

class MockLayoutService {
}

class MockParseService {
}

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
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

  fit('routing by default to info', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const location: Location = fixture.debugElement.injector.get(Location) as any;
    const router: Router = fixture.debugElement.injector.get(Router) as any;

    router.initialNavigation();
    router.navigate(['']);
    tick();
    expect(location.path()).toBe('/info(sidebar:manage)');
  }));

  fit('routing explicitly to info', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const location: Location = fixture.debugElement.injector.get(Location) as any;
    const router: Router = fixture.debugElement.injector.get(Router) as any;

    router.initialNavigation();
    router.navigate(['', {outlets: {primary: ['info'], sidebar: ['manage']}}]);
    tick();
    expect(location.path()).toBe('/info(sidebar:manage)');
  }));

  fit('routing to stats', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const location: Location = fixture.debugElement.injector.get(Location) as any;
    const router: Router = fixture.debugElement.injector.get(Router) as any;

    router.initialNavigation();
    router.navigate(['', {outlets: {primary: ['stats', 0], sidebar: ['manage']}}]);
    tick();
    expect(location.path()).toBe('/stats/0(sidebar:manage)');

  }));

  fit('routing to graph', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const location: Location = fixture.debugElement.injector.get(Location) as any;
    const router: Router = fixture.debugElement.injector.get(Router) as any;

    router.initialNavigation();
    router.navigate(['', {outlets: {primary: ['graph', 0], sidebar: ['edit', 0]}}]);
    tick();
    expect(location.path()).toBe('/graph/0(sidebar:edit/0)');
  }));

});
