import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';

export interface IDeactivateComponent {
  canExit: () => Observable<boolean>;
}

@Injectable({
  providedIn: 'root'
})
export class ExitEditingGuard implements CanDeactivate<unknown> {

  canDeactivate(
    component: IDeactivateComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return new Observable(o => {

      if (component.canExit) {
        component.canExit()
          .subscribe((value) => {
            if (!value) {
              history.pushState('', '', currentState.url);
              o.next(false);
            }
            o.next(true);
          });
      }
    });
  }

}
