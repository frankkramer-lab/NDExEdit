import {Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  networksParsed: NeNetwork[] = [];
  networksDownloaded: NeNetwork[] = [];

  constructor() {
  }

  getNetworkById(id: number): NeNetwork {
    return this.networksParsed.find(x => x.id === id);
  }

  removeMapping(networkId: number, mapId: string): void {
    const network = this.networksParsed.find(x => x.id === networkId);
    const mappingType = mapId.substring(0, 2);
    const mappingId = mapId.substring(2);

    switch (mappingType) {
      case 'nd':

        const ndSelectors = network.mappings.nodesDiscrete[mappingId].selectors;
        network.mappings.nodesDiscrete.splice(mappingId, 1);

        let ndNewStyle = [];
        for (const selector of ndSelectors) {

          ndNewStyle = ndNewStyle.concat(network.style.filter(x => x.selector !== selector));
          const className = selector.substring(1);

          for (const element of network.elements) {

            if (element.classes.includes(className)) {
              element.classes = element.classes.replace(className, '').trim();
            }
          }
        }

        network.style = ndNewStyle;

        break;
      case 'nc':

        network.mappings.nodesContinuous.splice(mappingId, 1);

        for (const value of network.mappings.nodesContinuous[mappingId].values) {
          const correspondingStyle = network.style.find(x => x.selector === value.selector);
          delete correspondingStyle.style[value.cssKey];
        }

        network.mappings.nodesContinuous.splice(mappingId, 1);

        break;
      case 'ed':
        const edSelectors = network.mappings.edgesDiscrete[mappingId].selectors;
        network.mappings.edgesDiscrete.splice(mappingId, 1);

        let edNewStyle = [];
        for (const selector of edSelectors) {

          edNewStyle = edNewStyle.concat(network.style.filter(x => x.selector !== selector));
          const className = selector.substring(1);

          for (const element of network.elements) {

            if (element.classes.includes(className)) {
              element.classes = element.classes.replace(className, '').trim();
            }
          }
        }

        network.style = edNewStyle;

        break;
      case 'ec':

        for (const value of network.mappings.edgesContinuous[mappingId].values) {

          const correspondingStyle = network.style.find(x => x.selector === value.selector);

          if (network.styleConstants['arrow-as-edge'] &&
            (value.cssKey === 'line-color' || value.cssKey === 'target-arrow-color' || value.cssKey === 'source-arrow-color')) {
            delete correspondingStyle.style['line-color'];
            delete correspondingStyle.style['target-arrow-color'];
            delete correspondingStyle.style['source-arrow-color'];
          } else {
            delete correspondingStyle.style[value.cssKey];
          }
        }

        network.mappings.edgesContinuous.splice(mappingId, 1);

        break;
    }
  }
}
