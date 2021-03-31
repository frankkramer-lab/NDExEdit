import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MainMappingsNewFormComponent} from './main-mappings-new-form.component';
import {DataService} from '../../../services/data.service';
import {UtilityService} from '../../../services/utility.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {createTranslateLoader} from '../../../app.module';
import {HttpClient} from '@angular/common/http';
import {NeNetwork} from '../../../models/ne-network';
import {FontAwesomeTestingModule} from '@fortawesome/angular-fontawesome/testing';

class MockDataService {
  colorProperties = [
    'TEST_NAME'
  ];

  selectedNetwork: NeNetwork = {
    id: 99999,
    core: null,
    cx: [],
    aspectKeyValuesEdges: [{
      name: 'edge-test',
      values: []
    }],
    aspectKeyValuesNodes: [{
      name: 'col',
      values: ['key1', 'key2']
    }],
    networkInformation: {},
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

class MockUtilityService {
  utilGetTypeLiteralByTypeHint = jasmine.createSpy('utilGetTypeLiteralByTypeHint').and.returnValue('nd');
}

describe('MainMappingsNewFormComponent', () => {
  let component: MainMappingsNewFormComponent;
  let fixture: ComponentFixture<MainMappingsNewFormComponent>;
  let dataService: DataService;
  let utilityService: UtilityService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MainMappingsNewFormComponent],
      imports: [
        HttpClientTestingModule,
        FontAwesomeTestingModule,
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
      .overrideComponent(MainMappingsNewFormComponent, {
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
    fixture = TestBed.createComponent(MainMappingsNewFormComponent);
    component = fixture.componentInstance;
    dataService = fixture.debugElement.injector.get(DataService) as any;
    utilityService = fixture.debugElement.injector.get(UtilityService) as any;

    // inputs
    component.isEdit = false;
    component.typeHint = {
      nd: true, nc: false, np: false, ed: false, ec: false, ep: false
    };
    component.mappingDiscrete = {
      col: 'col',
      styleProperty: 'styleTest',
      type: 'string',
      keys: ['key1', 'key2'],
      values: ['val1', 'val2'],
      useValue: [true, true]
    };
    component.propertyToMap = {
      name: 'property', values: ['1', '2', '3']
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
