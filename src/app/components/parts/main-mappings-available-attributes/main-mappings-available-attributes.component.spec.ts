import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MainMappingsAvailableAttributesComponent} from './main-mappings-available-attributes.component';
import {DataService} from '../../../services/data.service';
import {UtilityService} from '../../../services/utility.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {createTranslateLoader} from '../../../app.module';
import {HttpClient} from '@angular/common/http';

class MockDataService {}
class MockUtilityService {
  utilGetTypeHintByString = jasmine.createSpy('utilGetTypeHintByString').and.returnValue({
    nd: true, nc: false, np: false, ed: false, ec: false, ep: false
  });
}

describe('MainMappingsAvailableAttributesComponent', () => {
  let component: MainMappingsAvailableAttributesComponent;
  let fixture: ComponentFixture<MainMappingsAvailableAttributesComponent>;
  let dataService: DataService;
  let utilityService: UtilityService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MainMappingsAvailableAttributesComponent],
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
      .overrideComponent(MainMappingsAvailableAttributesComponent, {
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
    fixture = TestBed.createComponent(MainMappingsAvailableAttributesComponent);
    component = fixture.componentInstance;
    dataService = fixture.debugElement.injector.get(DataService) as any;
    utilityService = fixture.debugElement.injector.get(UtilityService) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
