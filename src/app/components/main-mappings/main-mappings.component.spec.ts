import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {MainMappingsComponent} from './main-mappings.component';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {createTranslateLoader} from '../../app.module';
import {HttpClient} from '@angular/common/http';
import {DataService} from '../../services/data.service';
import {UtilityService} from '../../services/utility.service';
import {NeNetwork} from '../../models/ne-network';
import * as cytoscape from 'cytoscape';
import {Router} from '@angular/router';

/**
 * Mocks {@link DataService}.
 * Overrides selection of a mapping.
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
        },
        {
          group: 'nodes',
          data: {
            id: '2'
          }
        },
        {
          group: 'nodes',
          data: {
            id: '3'
          }
        },
        {
          group: 'nodes',
          data: {
            id: '4'
          }
        },
        {
          group: 'edges',
          data: {
            id: '5',
            source: '1',
            target: '2'
          }
        },
        {
          group: 'edges',
          data: {
            id: '6',
            source: '3',
            target: '2'
          }
        },
        {
          group: 'edges',
          data: {
            id: '7',
            source: '2',
            target: '4'
          }
        }
      ]
    }),
    id: 99999,
    cx: [],
    mappings: {
      nodesDiscrete: [
        {
          col: 'colNd1',
          styleProperty: 'styleNd1',
          type: 'integer',
          keys: ['1', '13'],
          values: ['a1', 'a13']
        },
        {
          col: 'colNd1',
          styleProperty: 'NODE_FILL_COLOR',
          type: 'integer',
          keys: ['25', '13'],
          values: ['#9f0083', '#074386']
        },
        {
          col: 'colNd2',
          styleProperty: 'styleNd1',
          type: 'string',
          keys: ['val1', 'val2', 'val3', 'val4'],
          values: ['test10', 'test20', 'test30', 'test40']
        }],
      nodesContinuous: [
        {
          col: 'colNd1',
          styleProperty: 'styleNc1',
          lowers: ['1.0', '100.0'],
          equals: ['5.0', '200.0'],
          greaters: ['5.0', '200.0'],
          thresholds: ['1', '25'],
          chart: {
            chartType: {
              bar: false,
              line: true
            },
            chartData: [
              {
                data: [1.0, 5.0, 200.0, 200.0],
                label: 'styleNc1'
              }
            ],
            chartLabels: ['', '1', '25', '']
          },
          colorGradient: [],
          isColor: false
        },
        {
          col: 'colNc1',
          styleProperty: 'NODE_BORDER_PAINT',
          lowers: ['#00ff33', '#ff0033'],
          equals: ['#ff3333', '#93f3f2'],
          greaters: ['#922f11', '#30a2f9'],
          thresholds: ['0.0', '100.0'],
          chart: null,
          colorGradient: [
            {
              color: '#00ff33',
              offset: '-1',
              numericThreshold: '-1'
            },
            {
              color: null,
              offset: '0%',
              numericThreshold: '0.0'
            },
            {
              color: null,
              offset: '100%',
              numericThreshold: '100.0'
            },
            {
              color: '#30a2f9',
              offset: '101',
              numericThreshold: '101'
            }
          ],
          isColor: true
        }
      ],
      nodesPassthrough: [
        {
          col: 'name',
          styleProperty: 'NODE_LABEL'
        }
      ],
      edgesDiscrete: [
        {
          col: 'colEd1',
          styleProperty: 'styleEd1',
          type: 'string',
          keys: ['val20'],
          values: ['test20']
        },
        {
          col: 'colEd2',
          styleProperty: 'EDGE_UNSELECTED_PAINT',
          type: 'string',
          keys: ['col1', 'col2', 'col3'],
          values: ['#03f212', '#3ff8e2', '#f313f3']
        },
        {
          col: 'colEd1',
          styleProperty: 'EDGE_SELECTED_PAINT',
          type: 'string',
          keys: ['val20'],
          values: ['#f9f133']
        }],
      edgesContinuous: [
        {
          col: 'colEc1',
          styleProperty: 'nonColor',
          lowers: ['0.0', '4.0', '90.0'],
          equals: ['0.5', '4.5', '90.5'],
          greaters: ['1.0', '5.0', '91.0'],
          thresholds: ['1', '2', '3'],
          chart: {
            chartType: {
              bar: false,
              line: true
            },
            chartData: [
              {
                data: [0.0, 0.5, 4.5, 90.5, 91.0],
                label: 'nonColor'
              }
            ],
            chartLabels: ['', '1', '2', '3', '']
          },
          colorGradient: [],
          isColor: false
        },
        {
          col: 'colEc2',
          styleProperty: 'someColorProperty',
          lowers: ['#1f00f0', '#0f334f'],
          equals: ['#f3a124', '#3f2ff3'],
          greaters: ['#0f3148', '#3f9ff1'],
          thresholds: ['1', '100'],
          chart: null,
          colorGradient: [
            {
              color: '#1f00f0',
              offset: '-1',
              numericThreshold: '-1'
            },
            {
              color: '#f3a124',
              offset: '0%',
              numericThreshold: '1'
            },
            {
              color: '#3f2ff3',
              offset: '100%',
              numericThreshold: '100'
            },
            {
              color: '#3f9ff1',
              offset: '101',
              numericThreshold: '101'
            }
          ],
          isColor: true
        }
      ],
      edgesPassthrough: [
        {
          col: 'name',
          styleProperty: 'EDGE_LABEL'
        }
      ]
    },
    aspectKeyValuesNodes: [
      {
        name: 'colNd1',
        values: ['1', '13', '25'],
        datatype: 'integer',
        mapPointerD: ['nd0', 'nd1'],
        mapPointerC: ['nc0'],
        mapPointerP: [],
        chartDiscreteDistribution: {
          chartType: {bar: true, line: false},
          chartData: [
            {
              data: [1, 1, 2],
              label: 'colNd1'
            }
          ],
          chartLabels: ['1', '13', '25']
        },
        chartContinuousDistribution: {
          chartType: {bar: true, line: false},
          chartData: [
            {
              data: [1, 1, 2],
              label: 'colNd1'
            }
          ],
          chartLabels: ['0:10', '10:22', '22:27']
        },
        min: 1,
        max: 25,
        binSize: 3,
        validForContinuous: true,
        coverage: '100'
      },
      {
        name: 'colNd2',
        values: ['val1', 'val2', 'val3', 'val4'],
        datatype: 'string',
        mapPointerD: ['nd2'],
        mapPointerC: [],
        mapPointerP: [],
        chartDiscreteDistribution: {
          chartType: {bar: true, line: false},
          chartData: [
            {
              data: [1, 1, 1, 1],
              label: 'colNd2'
            }
          ],
          chartLabels: ['val1', 'val2', 'val3', 'val4']
        },
        validForContinuous: false,
        coverage: '100'
      },
      {
        name: 'colNc1',
        values: ['0.0', '4.3', '5.5', '100.0'],
        datatype: 'double',
        mapPointerD: [],
        mapPointerC: ['nc1'],
        mapPointerP: [],
        chartContinuousDistribution: {
          chartType: {bar: true, line: false},
          chartData: [
            {
              data: [3, 1],
              label: 'colNc1'
            }
          ],
          chartLabels: ['0.0:49.9', '50.0:100.0']
        },
        min: 0.0,
        max: 100.0,
        binSize: 2,
        coverage: '100'
      },
      {
        name: 'name',
        values: ['nodeLabel1', 'nodeLabel2', 'nodeLabel3', 'nodeLabel4'],
        mapPointerD: [],
        mapPointerC: [],
        mapPointerP: ['np0'],
        chartDiscreteDistribution: {
          chartType: {bar: true, line: false},
          chartData: [
            {
              data: [1, 1, 1, 1],
              label: 'name'
            }
          ],
          chartLabels: ['nodeLabel1', 'nodeLabel2', 'nodeLabel3', 'nodeLabel4']
        },
        validForContinuous: false,
        coverage: '100'
      }
    ],
    aspectKeyValuesEdges: [
      {
        name: 'colEd1',
        values: ['val20'],
        datatype: 'string',
        mapPointerD: ['ed0', 'ed2'],
        mapPointerC: [],
        mapPointerP: [],
        chartDiscreteDistribution: {
          chartType: {bar: true, line: false},
          chartData: [
            {
              data: [1],
              label: 'colEd1'
            }
          ],
          chartLabels: ['val20']
        },
        chartContinuousDistribution: null,
        validForContinuous: false,
        coverage: '33'
      },
      {
        name: 'colEd2',
        values: ['col1', 'col2', 'col3'],
        datatype: 'string',
        mapPointerD: ['ed1'],
        mapPointerC: [],
        mapPointerP: [],
        chartDiscreteDistribution: {
          chartType: {bar: true, line: false},
          chartData: [
            {
              data: [1, 1, 1],
              label: 'colEd2'
            }
          ],
          chartLabels: ['col1', 'col2', 'col3']
        },
        validForContinuous: false,
        coverage: '100'
      },
      {
        name: 'colEc1',
        values: ['1', '2', '3'],
        datatype: 'integer',
        mapPointerD: [],
        mapPointerC: ['ec0'],
        mapPointerP: [],
        chartContinuousDistribution: {
          chartType: {bar: true, line: false},
          chartData: [
            {
              data: [1, 1, 1],
              label: 'colEc1'
            }
          ],
          chartLabels: ['1', '2', '3']
        },
        validForContinuous: true,
        coverage: '100'
      },
      {
        name: 'colEc2',
        values: ['1', '100'],
        datatype: 'integer',
        mapPointerD: [],
        mapPointerC: ['ec1'],
        mapPointerP: [],
        chartContinuousDistribution: {
          chartType: {bar: true, line: false},
          chartData: [
            {
              data: [1, 1],
              label: 'colEc2'
            }
          ],
          chartLabels: ['1', '100']
        },
        validForContinuous: true,
        coverage: '66'
      },
      {
        name: 'name',
        values: ['edgeLabel1', 'edgeLabel2', 'edgeLabel3'],
        mapPointerD: [],
        mapPointerC: [],
        mapPointerP: ['ep0'],
        chartDiscreteDistribution: {
          chartType: {bar: true, line: false},
          chartData: [
            {
              data: [1, 1, 1],
              label: 'name'
            }
          ],
          chartLabels: ['edgeLabel1', 'edgeLabel2', 'edgeLabel3']
        },
        validForContinuous: false,
        coverage: '100'
      }
    ],
    networkInformation: {}
  };

  selectMapping = jasmine.createSpy('selectMapping', (mapHint, col, mapId) => {
  });

}

/**
 * Mocks {@link UtilityService}.
 */
class MockUtilityService {
}

/**
 * Unit test: MainMappingsComponent
 */
describe('MainMappingsComponent', () => {
  /**
   * Component
   */
  let component: MainMappingsComponent;
  /**
   * Fixture
   */
  let fixture: ComponentFixture<MainMappingsComponent>;
  /**
   * Service: Data
   */
  let dataService: DataService;
  /**
   * Service: Utility
   */
  let utilityService: MockUtilityService;

  /**
   * Setup
   */
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

  /**
   * Init
   */
  beforeEach(() => {
    fixture = TestBed.createComponent(MainMappingsComponent);
    component = fixture.componentInstance;
    dataService = fixture.debugElement.injector.get(DataService) as any;
    utilityService = fixture.debugElement.injector.get(UtilityService) as any;
    fixture.detectChanges();
  });

  /**
   * Test: Instance creation
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to home', fakeAsync(() => {

  }));

  it('should display details ND', () => {

  });

  // todo display details discrete => same col, different property => renders same table (routing)
  // todo display details continuous => same col, different property => renders different table
  // todo display details passthrough => different col, different property => renders different table
  // todo remove part of discrete => confirm
  // todo remove part of discrete => reject
  // todo remove discrete => confirm
  // todo remove discrete => reject
  // todo remove continuous => confirm
  // todo remove continuous => reject
  // todo remove passthrough => confirm
  // todo remove passthrough => reject

});
