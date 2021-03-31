import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {DataService} from '../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class MappingGuard implements CanActivate {

  constructor(
    private dataService: DataService,
    private router: Router
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): true | UrlTree {

    if (this.dataService.selectedNetwork) {

      // :mapId (has to be -1 or nc0)
      if (next.params.mapId) {

        if (next.params.mapId === '-1') {
          return true;
        } else {
          const mapHint = next.params.mapId.substring(0, 2);
          const mapId = Number(next.params.mapId.substring(2));

          if (
            (mapHint === 'nc' && this.dataService.selectedNetwork.mappings.nodesContinuous[mapId])
            || (mapHint === 'np' && this.dataService.selectedNetwork.mappings.nodesPassthrough[mapId])
            || (mapHint === 'ec' && this.dataService.selectedNetwork.mappings.edgesContinuous[mapId])
            || (mapHint === 'ep' && this.dataService.selectedNetwork.mappings.edgesPassthrough[mapId])
          ) {
            return true;
          }
        }
      }

      // :mapHint (has to be 'nd') and :col (has to be string with matching aspect.name)
      if (next.params.mapHint && next.params.col) {

        let matchingMappings;
        if (next.params.mapHint === 'nd') {
          matchingMappings = this.dataService.selectedNetwork.mappings.nodesDiscrete
            .filter(a => a.col === next.params.col);
        } else if (next.params.mapHint === 'ed') {
          matchingMappings = this.dataService.selectedNetwork.mappings.edgesDiscrete
            .filter(a => a.col === next.params.col);
        }

        if (matchingMappings.length > 0) {
          return true;
        }
      }
    }

    return this.router.parseUrl('/info(sidebar:manage)');
  }
}
