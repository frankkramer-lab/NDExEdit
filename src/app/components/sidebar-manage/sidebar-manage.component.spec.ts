import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SidebarManageComponent} from './sidebar-manage.component';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {createTranslateLoader} from '../../app.module';
import {HttpClient} from '@angular/common/http';
import {DataService} from '../../services/data.service';
import {UtilityService} from '../../services/utility.service';
import {ParseService} from '../../services/parse.service';

class MockDataService {}
class MockUtilityService {}
class MockParseService {}

describe('SidebarManageComponent', () => {
  let component: SidebarManageComponent;
  let fixture: ComponentFixture<SidebarManageComponent>;
  let dataService: DataService;
  let utilityService: UtilityService;
  let parseService: ParseService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarManageComponent],
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
      .overrideComponent(SidebarManageComponent, {
        set: {
          providers: [
            {provide: DataService, useClass: MockDataService},
            {provide: UtilityService, useClass: MockUtilityService},
            {provide: ParseService, useClass: MockParseService}
          ]
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarManageComponent);
    component = fixture.componentInstance;
    dataService = fixture.debugElement.injector.get(DataService) as any;
    utilityService = fixture.debugElement.injector.get(UtilityService) as any;
    parseService = fixture.debugElement.injector.get(ParseService) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
