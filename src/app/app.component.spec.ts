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

  selectNetwork = jasmine.createSpy('selectNetwork').and.callThrough();

  selectMapping = jasmine.createSpy('selectMapping').and.callThrough();

  resetAnyMappingSelection = jasmine.createSpy('resetAnyMappingSelection').and.callFake(() => {
  });

  resetDiscreteMappingPropertySelection = jasmine.createSpy('resetDiscreteMappingPropertySelection').and.callFake(() => {
  });
}

class MockUtilityService {
  utilGetTypeHintByString = jasmine.createSpy('utilGetTypeHintByString').and.returnValue({
    nd: true, nc: false, np: false, ed: false, ec: false, ep: false
  });
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

  it('routing by default to info', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const location: Location = fixture.debugElement.injector.get(Location) as any;
    const router: Router = fixture.debugElement.injector.get(Router) as any;

    router.initialNavigation();
    router.navigate(['']);
    tick();
    expect(location.path()).toBe('/info(sidebar:manage)');
  }));

  xit('routing explicitly to info', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const location: Location = fixture.debugElement.injector.get(Location) as any;
    const router: Router = fixture.debugElement.injector.get(Router) as any;

    router.initialNavigation();
    router.navigate(['', {outlets: {primary: ['info'], sidebar: ['manage']}}]);
    tick();
    expect(location.path()).toBe('/info(sidebar:manage)');
  }));

  xit('routing to stats', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const location: Location = fixture.debugElement.injector.get(Location) as any;
    const router: Router = fixture.debugElement.injector.get(Router) as any;

    router.initialNavigation();
    router.navigate(['', {outlets: {primary: ['stats', 0], sidebar: ['manage']}}]);
    tick();
    expect(location.path()).toBe('/stats/0(sidebar:manage)');

  }));

  xit('routing to graph', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const location: Location = fixture.debugElement.injector.get(Location) as any;
    const router: Router = fixture.debugElement.injector.get(Router) as any;

    router.initialNavigation();
    router.navigate(['', {outlets: {primary: ['graph', 0], sidebar: ['edit', 0]}}]);
    tick();
    expect(location.path()).toBe('/graph/0(sidebar:edit/0)');
  }));

  xit('routing to mappings', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const location: Location = fixture.debugElement.injector.get(Location) as any;
    const router: Router = fixture.debugElement.injector.get(Router) as any;

    router.initialNavigation();

    router.navigate(['', {outlets: {primary: ['mappings', -1]}}]);
    tick();
    expect(location.path()).toBe('/mappings/-1');

    router.navigate(['', {outlets: {primary: ['mappings', 'nd', 'colNd1']}}]);
    tick();
    expect(location.path()).toBe('/mappings/nd/colNd1');

    router.navigate(['', {outlets: {primary: ['mappings', 'nc0']}}]);
    tick();
    expect(location.path()).toBe('/mappings/nc0');

  }));

  xit('routing to new-mappings', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const location: Location = fixture.debugElement.injector.get(Location) as any;
    const router: Router = fixture.debugElement.injector.get(Router) as any;

    router.initialNavigation();

    router.navigate(['', {outlets: {primary: ['new', 'nd', 0]}}]);
    tick();
    expect(location.path()).toBe('/new/nd/0');
  }));

  xit('routing to edit-mappings', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const location: Location = fixture.debugElement.injector.get(Location) as any;
    const router: Router = fixture.debugElement.injector.get(Router) as any;

    router.initialNavigation();

    router.navigate(['', {outlets: {primary: ['edit', 'nd0']}}]);
    tick();
    expect(location.path()).toBe('/edit/nd0');
  }));

});
