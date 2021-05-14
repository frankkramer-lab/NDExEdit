import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {DataService} from '../services/data.service';
import {UtilityService} from '../services/utility.service';
import {NeAspect} from '../models/ne-aspect';

@Injectable({
  providedIn: 'root'
})
export class MappingGuard implements CanActivate {
  /**
   * Main page
   */
  defaultRoute = '/info(sidebar:manage)';

  /**
   *
   * @param dataService Service responsible for data access
   * @param router Needed to activate specific routes, when guard fails
   * @param utilityService Service responsible for shared code
   */
  constructor(
    private dataService: DataService,
    private router: Router,
    private utilityService: UtilityService
  ) {
  }

  /**
   * Called on guard evaluation
   * @param next Contains available params
   * @param state Contains url
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): true | UrlTree {

    if (this.dataService.selectedNetwork) {

      // Continuous or passthrough mapping details
      if (next.params.mapId) {
        return this.evaluateContinuousPassthroughMapping(next);
      }

      // Discrete mapping details
      else if (next.params.mapHint && next.params.col) {
        return this.evaluateDiscreteMapping(next);
      }

      // Create or edit mapping
      else {
        if (next.params.propertyId) {
          // new
          return this.evaluateNewMapping(next);

        } else {
          // edit
          return this.evaluateEditMapping(next);
        }
      }
    }

    return this.router.parseUrl(this.defaultRoute);
  }

  /**
   * Handles guarding details about continuous or passthrough mappings
   * @param next Contains routing params
   */
  evaluateContinuousPassthroughMapping(next: ActivatedRouteSnapshot): true | UrlTree {
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
      return this.router.parseUrl(this.defaultRoute);
    }
  }

  /**
   * Handles guarding details about discrete mappings
   * @param next Contains routing params
   */
  evaluateDiscreteMapping(next: ActivatedRouteSnapshot): true | UrlTree {
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
    return this.router.parseUrl(this.defaultRoute);
  }

  /**
   * Handles guarding creating new mappings
   * @param next Contains routing params
   */
  evaluateNewMapping(next: ActivatedRouteSnapshot): true | UrlTree {
    const numericPropertyId = Number(next.params.propertyId);
    const typeHintNew = this.utilityService.utilGetTypeHintByString(next.params.map);
    let aspects: NeAspect[];

    if (typeHintNew.nd || typeHintNew.nc || typeHintNew.np) {
      aspects = this.dataService.selectedNetwork.aspectKeyValuesNodes;
    } else {
      aspects = this.dataService.selectedNetwork.aspectKeyValuesEdges;
    }

    if (typeHintNew.nd || typeHintNew.ed) {
      aspects = this.utilityService.utilFilterForDiscrete(aspects);
    } else if (typeHintNew.nc || typeHintNew.ec) {
      aspects = this.utilityService.utilFilterForContinuous(aspects);
    }

    if (aspects[numericPropertyId]) {
      return true;
    }
    return this.router.parseUrl(this.defaultRoute);
  }

  /**
   * Handles guarding editing new mappings
   * @param next Contains routing params
   */
  evaluateEditMapping(next: ActivatedRouteSnapshot): true | UrlTree {
    const mapHint = next.params.map.substring(0, 2);
    const mapId = Number(next.params.map.substring(2));

    switch (mapHint) {
      case 'nd':
        if (this.dataService.selectedNetwork.mappings.nodesDiscrete[mapId]) {
          return true;
        }
        break;
      case 'nc':
        if (this.dataService.selectedNetwork.mappings.nodesContinuous[mapId]) {
          return true;
        }
        break;
      case 'ed':
        if (this.dataService.selectedNetwork.mappings.edgesDiscrete[mapId]) {
          return true;
        }
        break;
      case 'ec':
        if (this.dataService.selectedNetwork.mappings.edgesContinuous[mapId]) {
          return true;
        }
        break;
    }
    return this.router.parseUrl(this.defaultRoute);
  }
}
