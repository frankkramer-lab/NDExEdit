import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ChartComponent} from './chart.component';
import {DataService} from '../../../services/data.service';
import {UtilityService} from '../../../services/utility.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {createTranslateLoader} from '../../../app.module';
import {HttpClient} from '@angular/common/http';
import {MainGraphComponent} from '../../main-graph/main-graph.component';

class MockDataService {
}

class MockUtilityService {
}

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;
  let dataService: DataService;
  let utilityService: UtilityService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChartComponent],
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
      .overrideComponent(MainGraphComponent, {
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
    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    dataService = fixture.debugElement.injector.get(DataService) as any;
    utilityService = fixture.debugElement.injector.get(UtilityService) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
