import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MainGraphComponent} from './main-graph.component';
import {RouterTestingModule} from '@angular/router/testing';
import {DataService} from '../../services/data.service';
import {GraphService} from '../../services/graph.service';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {createTranslateLoader} from '../../app.module';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {NeNetwork} from '../../models/ne-network';
import {By} from '@angular/platform-browser';
import * as cytoscape from 'cytoscape';

/**
 * Mocks {@link DataService}.
 * Provides a simple network.
 * Overrides canvas and network management.
 */
class MockDataService {
  canvas: HTMLElement;

  selectedNetwork: NeNetwork = {
    core: cytoscape({
      container: this.canvas,
      elements: [
        {
          group: 'nodes',
          data: {
            id: '1'
          }
        }]
    }),
    id: 99999,
    cx: [],
    mappings: {
      nodesDiscrete: [],
      nodesContinuous: [],
      nodesPassthrough: [],
      edgesDiscrete: [],
      edgesContinuous: [],
      edgesPassthrough: []
    },
    networkInformation: {}
  };

  setCanvas = jasmine.createSpy('setCanvas').and.callFake((canvas) => {
    this.canvas = canvas;
  });

  getCanvas = jasmine.createSpy('getCanvas').and.callFake(() => {
    return this.canvas;
  });

  getSelectedNetwork = jasmine.createSpy('getSelectedNetwork').and.callFake(() => {
    return this.selectedNetwork;
  });

}

/**
 * Mocks {@link GraphService}.
 * Overrides core event subscriptions and rendering.
 */
class MockGraphService {
  unsubscribeFromCoreEvents = jasmine.createSpy('unsubscribeFromCoreEvents').and.callFake(() => {
  });

  subscribeToCoreEvents = jasmine.createSpy('subscribeToCoreEvents').and.callFake(() => {
  });

  render = jasmine.createSpy('render').and.callFake((network: NeNetwork) => {
    return new Promise<NeNetwork>(resolve => network);
  });
}

/**
 * Unit test: MainGraphComponent
 */
describe('MainGraphComponent', () => {
  /**
   * Component
   */
  let component: MainGraphComponent;
  /**
   * Fixture
   */
  let fixture: ComponentFixture<MainGraphComponent>;
  /**
   * DOM: Container for graph
   */
  let cyContainer: HTMLElement;
  /**
   * Service: Data
   */
  let dataService: DataService;
  /**
   * Service: Graph
   */
  let graphService: GraphService;
  /**
   * Setup
   */
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MainGraphComponent],
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
      .overrideComponent(MainGraphComponent, {
        set: {
          providers: [
            {provide: DataService, useClass: MockDataService},
            {provide: GraphService, useClass: MockGraphService}
          ]
        }
      })
      .compileComponents();
  }));

  /**
   * Init
   */
  beforeEach(() => {
    fixture = TestBed.createComponent(MainGraphComponent);
    component = fixture.componentInstance;
    dataService = fixture.debugElement.injector.get(DataService) as any;
    graphService = fixture.debugElement.injector.get(GraphService) as any;
    cyContainer = fixture.debugElement.query(By.css('#cy')).nativeElement;
    fixture.detectChanges();
  });

  /**
   * Test: Instance creation
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Test: Rendering
   */
  it('should render a simple graph', () => {
    expect(graphService.render).toHaveBeenCalled();
    expect(dataService.getSelectedNetwork().core).not.toBeNull();
    expect(component.dataService.getSelectedNetwork().core.elements.length).toEqual(1);
  });

});
