import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MainMappingsComponent} from './main-mappings.component';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {createTranslateLoader} from '../../app.module';
import {HttpClient} from '@angular/common/http';
import {DataService} from '../../services/data.service';
import {UtilityService} from '../../services/utility.service';

class MockDataService {
  selectMapping = jasmine.createSpy('selectMapping', (mapHint, col, mapId) => {});
}
class MockUtilityService {}

describe('MainMappingsComponent', () => {
  let component: MainMappingsComponent;
  let fixture: ComponentFixture<MainMappingsComponent>;
  let dataService: DataService;
  let utilityService: MockUtilityService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MainMappingsComponent],
      imports: [
        RouterTestingModule,
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
      .overrideComponent(MainMappingsComponent, {
        set: {
          providers: [
            {provide: DataService, useClass: MockDataService},
            {provide: UtilityService, useClass: MockUtilityService}
          ]
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainMappingsComponent);
    component = fixture.componentInstance;
    dataService = fixture.debugElement.injector.get(DataService) as any;
    utilityService = fixture.debugElement.injector.get(UtilityService) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
