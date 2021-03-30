import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AlertMappingAlreadyExistsComponent} from './alert-mapping-already-exists.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {createTranslateLoader} from '../../../app.module';
import {HttpClient} from '@angular/common/http';
import {DataService} from '../../../services/data.service';
import {NeMappingsType} from '../../../models/ne-mappings-type';
import {NeNetwork} from '../../../models/ne-network';

class MockDataService {
  selectedNetwork: NeNetwork = {
    id: 99999,
    networkInformation: {},
    cx: [],
    core: null,
    mappings: {
      nodesDiscrete: [],
      nodesContinuous: [],
      nodesPassthrough: [],
      edgesDiscrete: [],
      edgesContinuous: [],
      edgesPassthrough: []
    }
  };
}

describe('AlertMappingAlreadyExistsComponent', () => {
  let component: AlertMappingAlreadyExistsComponent;
  let fixture: ComponentFixture<AlertMappingAlreadyExistsComponent>;
  let dataService: DataService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AlertMappingAlreadyExistsComponent],
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
      .overrideComponent(AlertMappingAlreadyExistsComponent, {
        set: {
          providers: [
            {provide: DataService, useClass: MockDataService}
          ]
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertMappingAlreadyExistsComponent);
    component = fixture.componentInstance;
    dataService = fixture.debugElement.injector.get(DataService) as any;
    component.typeHint = {
      nd: true, nc: false, np: false, ed: false, ec: false, ep: false
    };
    component.propertyToMap = {
      name: 'test property', values: ['1', '5', '63']
    };
    component.styleProperty = 'test style';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
