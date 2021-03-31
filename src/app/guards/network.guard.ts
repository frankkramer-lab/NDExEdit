import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {DataService} from '../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class NetworkGuard implements CanActivate {

  constructor(
    private dataService: DataService,
    private router: Router
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): true | UrlTree {

    if (next.params.id) {
      const id = next.params.id;
      if (this.dataService.networksParsed[id]) {
        return true;
      }
    }

    return this.router.parseUrl('/info(sidebar:manage)');
  }

}
