import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarImageComponent } from './sidebar-image.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {createTranslateLoader} from '../../app.module';
import {HttpClient} from '@angular/common/http';
import {DataService} from '../../services/data.service';
import {GraphService} from '../../services/graph.service';
import {NeNetwork} from '../../models/ne-network';
import {FontAwesomeTestingModule} from '@fortawesome/angular-fontawesome/testing';

class MockDataService {
  selectedNetwork: NeNetwork = {
    id: 99999,
    cx: [],
    core: null,
    mappings: {
      nodesDiscrete: [],
      nodesContinuous: [],
      nodesPassthrough: [],
      edgesDiscrete: [],
      edgesContinuous: [],
      edgesPassthrough: []
    },
    networkInformation: {},
    showLabels: true,
  };

  getSelectedNetwork = jasmine.createSpy('getSelectedNetwork').and.returnValue(this.selectedNetwork);
}
class MockGraphService {}

describe('SidebarImageComponent', () => {
  let component: SidebarImageComponent;
  let fixture: ComponentFixture<SidebarImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarImageComponent],
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
      .overrideComponent(SidebarImageComponent, {
        set: {
          providers: [
            {provide: DataService, useClass: MockDataService},
            {provide: GraphService, useClass: MockGraphService}
          ]
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });
});
