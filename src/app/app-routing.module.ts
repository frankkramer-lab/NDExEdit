import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainInfoComponent} from './components/main-info/main-info.component';
import {SidebarManageComponent} from './components/sidebar-manage/sidebar-manage.component';
import {MainGraphComponent} from './components/main-graph/main-graph.component';
import {SidebarEditComponent} from './components/sidebar-edit/sidebar-edit.component';
import {MainStatsComponent} from './components/main-stats/main-stats.component';
import {SidebarCompareComponent} from './components/sidebar-compare/sidebar-compare.component';

const routes: Routes = [
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
    children: [
      {
        path: '',
        component: MainInfoComponent,
      },
    ]
  },
  {
    path: 'stats/:id',
    component: MainStatsComponent,
    children: [
      {
        path: '',
        component: MainInfoComponent
      }
    ]
  },
  {
    path: 'manage',
    component: SidebarManageComponent,
    outlet: 'sidebar'
  },
  {
    path: 'edit/:id',
    component: SidebarEditComponent,
    outlet: 'sidebar',
    children: [
      {
        path: '',
        component: SidebarManageComponent
      }
    ]
  },
  {
    path: 'compare/:id',
    component: SidebarCompareComponent,
    outlet: 'sidebar',
    children: [
      {
        path: '',
        component: SidebarManageComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
