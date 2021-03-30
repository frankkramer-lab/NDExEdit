import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MainStatsComponent} from './main-stats.component';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {createTranslateLoader} from '../../app.module';
import {HttpClient} from '@angular/common/http';
import {DataService} from '../../services/data.service';
import {UtilityService} from '../../services/utility.service';

class MockDataService {}
class MockUtilityService {}

describe('MainStatsComponent', () => {
  let component: MainStatsComponent;
  let fixture: ComponentFixture<MainStatsComponent>;
  let dataService: DataService;
  let utilityService: UtilityService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MainStatsComponent],
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
      .overrideComponent(MainStatsComponent, {
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
    fixture = TestBed.createComponent(MainStatsComponent);
    component = fixture.componentInstance;
    dataService = fixture.debugElement.injector.get(DataService);
    utilityService = fixture.debugElement.injector.get(UtilityService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
