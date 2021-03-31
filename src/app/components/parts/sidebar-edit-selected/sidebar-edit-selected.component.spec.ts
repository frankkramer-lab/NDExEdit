import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SidebarEditSelectedComponent} from './sidebar-edit-selected.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {createTranslateLoader} from '../../../app.module';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {GraphService} from '../../../services/graph.service';
import {NeSelection} from '../../../models/ne-selection';

class MockGraphService {
  selectedElements: NeSelection = {
    nodes: [],
    edges: []
  };
}

describe('SidebarEditSelectedComponent', () => {
  let component: SidebarEditSelectedComponent;
  let fixture: ComponentFixture<SidebarEditSelectedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarEditSelectedComponent],
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
      .overrideComponent(SidebarEditSelectedComponent, {
        set: {
          providers: [
            {provide: GraphService, useClass: MockGraphService}
          ]
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarEditSelectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
