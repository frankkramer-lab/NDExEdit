import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MainMappingsNewComponent} from './main-mappings-new.component';
import {DataService} from '../../services/data.service';
import {UtilityService} from '../../services/utility.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {createTranslateLoader} from '../../app.module';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';

class MockDataService {}

class MockUtilityService {}

describe('MainMappingsNewComponent', () => {
  let component: MainMappingsNewComponent;
  let fixture: ComponentFixture<MainMappingsNewComponent>;
  let dataService: DataService;
  let utilityService: UtilityService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MainMappingsNewComponent],
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
      .overrideComponent(MainMappingsNewComponent, {
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
    fixture = TestBed.createComponent(MainMappingsNewComponent);
    component = fixture.componentInstance;
    dataService = fixture.debugElement.injector.get(DataService) as any;
    utilityService = fixture.debugElement.injector.get(UtilityService) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
