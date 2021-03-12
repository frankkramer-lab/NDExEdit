import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SidebarEditComponent} from './sidebar-edit.component';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {createTranslateLoader} from '../../app.module';
import {HttpClient} from '@angular/common/http';
import {DataService} from '../../services/data.service';
import {UtilityService} from '../../services/utility.service';
import {GraphService} from '../../services/graph.service';
import {NeNetwork} from '../../models/ne-network';
import {FontAwesomeTestingModule} from '@fortawesome/angular-fontawesome/testing';
import {NeSelection} from '../../models/ne-selection';

class MockDataService {
  selectedNetwork: NeNetwork = {
    id: 99999,
    core: null,
    cx: [],
    mappings: {
      nodesDiscrete: [],
      nodesContinuous: [],
      nodesPassthrough: [],
      edgesDiscrete: [],
      edgesContinuous: [],
      edgesPassthrough: []
    },
    networkInformation: {
      name: 'Test name',
      uuid: '1234-54-98'
    }
  };
  getSelectedNetwork = jasmine.createSpy('getSelectedNetwork').and.callThrough();

}
class MockUtilityService {}
class MockGraphService {
  selectedElements: NeSelection = {
    nodes: [],
    edges: []
  };
}

describe('SidebarEditComponent', () => {
  let component: SidebarEditComponent;
  let fixture: ComponentFixture<SidebarEditComponent>;
  let dataService: DataService;
  let graphService: GraphService;
  let utilityService: UtilityService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarEditComponent],
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
      providers: []
    })
      .overrideComponent(SidebarEditComponent, {
        set: {
          providers: [
            {provide: DataService, useClass: MockDataService},
            {provide: UtilityService, useClass: MockUtilityService},
            {provide: GraphService, useClass: MockGraphService}
          ]
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarEditComponent);
    component = fixture.componentInstance;
    dataService = fixture.debugElement.injector.get(DataService) as any;
    utilityService = fixture.debugElement.injector.get(UtilityService) as any;
    graphService = fixture.debugElement.injector.get(GraphService) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
