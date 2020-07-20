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
import { MainMappingsComponent } from './components/main-mappings/main-mappings.component';

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
    MainMappingsComponent
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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
