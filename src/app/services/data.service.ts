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

  // todo update aspectKeyValues -> pointers to corresponding mappings after deletion
  removeMapping(map: any): void {

    const network = this.getNetworkById(map.network);

    switch (map.type) {
      case 'nd':
        const ndSelectors = network.mappings.nodesDiscrete[map.mappingId].selectors;
        network.mappings.nodesDiscrete.splice(map.mappingId, 1);

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
        network.aspectKeyValuesNodes[map.akvIndex].mapPointerD = network.aspectKeyValuesNodes[map.akvIndex].mapPointerD.filter(x => x !== map.mappingId);
        break;
      case 'nc':

        network.mappings.nodesContinuous.splice(map.mappingId, 1);

        for (const value of network.mappings.nodesContinuous[map.mappingId].values) {
          const correspondingStyle = network.style.find(x => x.selector === value.selector);
          delete correspondingStyle.style[value.cssKey];
        }

        network.mappings.nodesContinuous.splice(map.mappingId, 1);
        network.aspectKeyValuesNodes[map.akvIndex].mapPointerC = network.aspectKeyValuesNodes[map.akvIndex].mapPointerC.filter(x => x !== map.mappingId);
        break;
      case 'ed':

        const edSelectors = network.mappings.edgesDiscrete[map.mappingId].selectors;
        network.mappings.edgesDiscrete.splice(map.mappingId, 1);

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
        network.aspectKeyValuesEdges[map.akvIndex].mapPointerD = network.aspectKeyValuesEdges[map.akvIndex].mapPointerD.filter(x => x !== map.mappingId);
        network.style = edNewStyle;
        break;
      case 'ec':

        for (const value of network.mappings.edgesContinuous[map.mappingId].values) {

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
        network.aspectKeyValuesEdges[map.akvIndex].mapPointerC = network.aspectKeyValuesEdges[map.akvIndex].mapPointerC.filter(x => x !== map.mappingId);
        network.mappings.edgesContinuous.splice(map.mappingId, 1);
        break;
    }
  }

}
