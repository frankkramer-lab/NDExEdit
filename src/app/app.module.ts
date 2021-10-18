import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MainGraphComponent} from './components/main-graph/main-graph.component';
import {MainInfoComponent} from './components/main-info/main-info.component';
import {MainStatsComponent} from './components/main-stats/main-stats.component';
import {SidebarManageComponent} from './components/sidebar-manage/sidebar-manage.component';
import {SidebarEditComponent} from './components/sidebar-edit/sidebar-edit.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChartsModule} from 'ng2-charts';
import {DataService} from './services/data.service';
import {GraphService} from './services/graph.service';
import {ParseService} from './services/parse.service';
import {UtilityService} from './services/utility.service';
import {ChartComponent} from './components/parts/chart/chart.component';
import {UniqueColsPipe} from './pipes/uniqueCols.pipe';
import {IsByColPipe} from './pipes/isByCol.pipe';
import {StylePropertiesByCol} from './pipes/stylePropertiesByCol.pipe';
import {StyleValueByColAndKeyPipe} from './pipes/styleValueByColAndKey.pipe';
import {AttributesByElementPipe} from './pipes/attributesByElement.pipe';
import {LayoutService} from './services/layout.service';
import {SidebarImageComponent} from './components/sidebar-image/sidebar-image.component';
import {SidebarEditSelectedComponent} from './components/parts/sidebar-edit-selected/sidebar-edit-selected.component';
import {SidebarEditInspectComponent} from './components/parts/sidebar-edit-inspect/sidebar-edit-inspect.component';
import {SidebarEditMappingContinuousComponent} from './components/parts/sidebar-edit-mapping-continuous/sidebar-edit-mapping-continuous.component';
import {StylePropertyValidatorDirective} from './validators/style-property.directive';
import {ThresholdsValidatorDirective} from './validators/thresholds.directive';
import {UseValuesValidatorDirective} from './validators/use-values.directive';
import {ElementPropertyValidatorDirective} from './validators/element-property.directive';
import {DragbarComponent} from './components/dragbar/dragbar.component';
import {SidebarEditMappingDiscreteComponent} from './components/parts/sidebar-edit-mapping-discrete/sidebar-edit-mapping-discrete.component';
import {SidebarEditAddCollectionComponent} from './components/parts/sidebar-edit-add-collection/sidebar-edit-add-collection.component';
import {SidebarEditMappingComponent} from './components/parts/sidebar-edit-mapping/sidebar-edit-mapping.component';
import {SidebarEditInfoComponent} from './components/parts/sidebar-edit-info/sidebar-edit-info.component';
import {CollectionDiscretePipe} from './pipes/collectionDiscrete.pipe';
import {PropertyService} from './services/property.service';

export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    MainGraphComponent,
    MainInfoComponent,
    MainStatsComponent,
    SidebarManageComponent,
    SidebarEditComponent,
    ChartComponent,
    UniqueColsPipe,
    IsByColPipe,
    CollectionDiscretePipe,
    StylePropertiesByCol,
    StyleValueByColAndKeyPipe,
    AttributesByElementPipe,
    SidebarImageComponent,
    SidebarEditSelectedComponent,
    SidebarEditInspectComponent,
    SidebarEditMappingContinuousComponent,
    StylePropertyValidatorDirective,
    ThresholdsValidatorDirective,
    UseValuesValidatorDirective,
    ElementPropertyValidatorDirective,
    UseValuesValidatorDirective,
    DragbarComponent,
    SidebarEditMappingDiscreteComponent,
    SidebarEditAddCollectionComponent,
    SidebarEditMappingComponent,
    SidebarEditInfoComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    NgbModule,
    AppRoutingModule,
    FontAwesomeModule,
    ChartsModule,
    ReactiveFormsModule
  ],
  providers: [
    DataService,
    GraphService,
    ParseService,
    UtilityService,
    LayoutService,
    PropertyService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
