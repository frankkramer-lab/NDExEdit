import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SidebarEditInspectComponent} from './sidebar-edit-inspect.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {createTranslateLoader} from '../../../app.module';
import {HttpClient} from '@angular/common/http';
import {GraphService} from '../../../services/graph.service';
import {DataService} from '../../../services/data.service';
import {UtilityService} from '../../../services/utility.service';

class MockDataService {
}

class MockUtilityService {
}

class MockGraphService {
}

describe('SidebarEditInspectComponent', () => {
  let component: SidebarEditInspectComponent;
  let fixture: ComponentFixture<SidebarEditInspectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarEditInspectComponent],
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
      .overrideComponent(SidebarEditInspectComponent, {
        set: {
          providers: [
            {provide: DataService, useClass: MockDataService},
            {provide: GraphService, useClass: MockGraphService},
            {provide: UtilityService, useClass: MockUtilityService}
          ]
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarEditInspectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
