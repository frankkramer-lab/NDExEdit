import {Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import {NeMappingsDefinition} from '../models/ne-mappings-definition';
import {NeStyle} from '../models/ne-style';
import {NeNode} from '../models/ne-node';
import {NeEdge} from '../models/ne-edge';

@Injectable({
  providedIn: 'root'
})

/**
 * Service containing globally accessible data and providing manipulations
 */
export class DataService {

  /**
   * List of networks available to be rendered within the app
   */
  networksParsed: NeNetwork[] = [];

  /**
   * List of networks available in .cx file format
   */
  networksDownloaded: NeNetwork[] = [];

  constructor() {
  }

  /**
   * Fetches a network by its id
   * @param id The network's id
   */
  getNetworkById(id: number): NeNetwork {
    return this.networksParsed.find(x => x.id === id);
  }

  /**
   * Removes a mapping completely
   * @param map The specified mappping
   */
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

  /**
   * Adds a new mapping to an already parsed network
   * @param id The network's id
   * @param isNode Indicates if the type to which the mapping belongs is a {@link NeNode|node}
   * @param discreteMapping The specified mapping which is filled in {@link MainMappingsNewComponent}
   */
  addMappingDiscrete(id: number, isNode: boolean, discreteMapping: NeMappingsDefinition[]): void {
    const network = this.getNetworkById(id);
    const styles: NeStyle[] = network.style;
    const elements = network.elements;

    for (const map of discreteMapping) {
      const styleProperty = {};
      styleProperty[map.cssKey] = map.cssValue;
      const styleMap: NeStyle = {
        selector: map.selector,
        style: styleProperty,
        appliedTo: []
      };

      for (const element of elements) {
        for (const attribute of element.data.attributes) {
          if (attribute.key === map.col && attribute.value === map.is) {
            element.data.classes.push(map.selector.substring(1));
            element.classes = element.data.classes.join(' ');
            if (isNode && !styleMap.appliedTo.includes(element.data as NeNode)) {
              styleMap.appliedTo.push(element.data as NeNode);
              break;
            } else if (!styleMap.appliedTo.includes(element.data as NeEdge)) {
              styleMap.appliedTo.push(element.data as NeEdge);
              break;
            }
          }
        }
        if (!styles.includes(styleMap)) {
          styles.push(styleMap);
        }
      }
    }
    network.style = styles; // todo order accordingly
    network.elements = elements;
    this.networksParsed.filter(x => x.id !== id).concat(network);
  }
}
