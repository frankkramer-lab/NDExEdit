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
import {SidebarCompareComponent} from './components/sidebar-compare/sidebar-compare.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule} from '@angular/forms';
import {ChartsModule} from 'ng2-charts';
import {MainMappingsComponent} from './components/main-mappings/main-mappings.component';
import {MainMappingsNewComponent} from './components/main-mappings-new/main-mappings-new.component';
import {DataService} from './services/data.service';
import {GraphService} from './services/graph.service';
import {ParseService} from './services/parse.service';
import {UtilityService} from './services/utility.service';
import {MainMappingsAvailableAttributesComponent} from './components/parts/main-mappings-available-attributes/main-mappings-available-attributes.component';
import { AlertMappingAlreadyExistsComponent } from './components/parts/alert-mapping-already-exists/alert-mapping-already-exists.component';
import { MainMappingsNewFormComponent } from './components/parts/main-mappings-new-form/main-mappings-new-form.component';
import { ChartComponent } from './components/parts/chart/chart.component';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    MainGraphComponent,
    MainInfoComponent,
    MainStatsComponent,
    SidebarManageComponent,
    SidebarEditComponent,
    SidebarCompareComponent,
    MainMappingsComponent,
    MainMappingsNewComponent,
    MainMappingsAvailableAttributesComponent,
    AlertMappingAlreadyExistsComponent,
    MainMappingsNewFormComponent,
    ChartComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    AppRoutingModule,
    FontAwesomeModule,
    NgbModule,
    ChartsModule
  ],
  providers: [
    DataService,
    GraphService,
    ParseService,
    UtilityService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
