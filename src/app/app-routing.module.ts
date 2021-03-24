import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainInfoComponent} from './components/main-info/main-info.component';
import {SidebarManageComponent} from './components/sidebar-manage/sidebar-manage.component';
import {MainGraphComponent} from './components/main-graph/main-graph.component';
import {SidebarEditComponent} from './components/sidebar-edit/sidebar-edit.component';
import {MainStatsComponent} from './components/main-stats/main-stats.component';
import {SidebarCompareComponent} from './components/sidebar-compare/sidebar-compare.component';
import {MainMappingsComponent} from './components/main-mappings/main-mappings.component';
import {MainMappingsNewComponent} from './components/main-mappings-new/main-mappings-new.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/info(sidebar:manage)',
    pathMatch: 'full'
  },
  {
    path: 'info',
    component: MainInfoComponent,
  },
  {
    path: 'graph/:id',
    component: MainGraphComponent,
  },
  {
    path: 'stats/:id',
    component: MainStatsComponent,
  },
  {
    path: 'mappings/:mapHint/:col',
    component: MainMappingsComponent,
  },
  {
    path: 'mappings/:mapId',
    component: MainMappingsComponent,
  },
  {
    path: 'new/:map/:propertyId/:isEdit',
    component: MainMappingsNewComponent,
  },
  {
    path: 'edit/:map/:propertyId/:isEdit',
    component: MainMappingsNewComponent,
  },
  {
    path: 'edit/:map/:isEdit',
    component: MainMappingsNewComponent,
  },
  {
    path: 'manage',
    component: SidebarManageComponent,
    outlet: 'sidebar'
  },
  {
    path: 'edit/:id',
    component: SidebarEditComponent,
    outlet: 'sidebar'
  },
  {
    path: 'compare/:id',
    component: SidebarCompareComponent,
    outlet: 'sidebar'
  },
  {
    path: '**',
    component: SidebarManageComponent,
    outlet: 'sidebar'
  },
  {
    path: '**',
    component: MainInfoComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
