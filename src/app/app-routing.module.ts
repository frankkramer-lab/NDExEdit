import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainInfoComponent} from './components/main-info/main-info.component';
import {SidebarManageComponent} from './components/sidebar-manage/sidebar-manage.component';
import {MainGraphComponent} from './components/main-graph/main-graph.component';
import {SidebarEditComponent} from './components/sidebar-edit/sidebar-edit.component';
import {NetworkGuard} from './guards/network.guard';
import {ExitEditingGuard} from './guards/exit-editing.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/info(sidebar:manage)',
    pathMatch: 'full'
  },
  {
    path: 'info',
    component: MainInfoComponent
  },
  {
    path: 'graph/:id',
    component: MainGraphComponent,
    canActivate: [NetworkGuard]
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
    canActivate: [NetworkGuard],
    canDeactivate: [ExitEditingGuard]
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
