import {Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import {NeMappingsDefinition} from '../models/ne-mappings-definition';
import {NeStyle} from '../models/ne-style';
import {NeNode} from '../models/ne-node';
import {NeEdge} from '../models/ne-edge';
import {NeGroupedMappingsDiscrete} from '../models/ne-grouped-mappings-discrete';
import {NeMappingsMap} from '../models/ne-mappings-map';

@Injectable({
  providedIn: 'root'
})

/**
 * Service containing globally accessible data and providing manipulations
 */
export class DataService {

  constructor() {
  }

  /**
   * List of networks available to be rendered within the app
   */
  networksParsed: NeNetwork[] = [];

  /**
   * List of networks available in .cx file format
   */
  networksDownloaded: NeNetwork[] = [];

  /**
   * List of known color properties, mainly used for color previews within {@link MainMappingsNewComponent}
   */
  colorProperties: string[] = [
    'background-color',
    'border-color',
    'line-color',
    'target-arrow-color',
    'source-arrow-color',
  ];

  /**
   * Orders styles by their priority to avoid overriding high priority styles with newly added styles
   *
   * @param styles List of styles to be sorted
   */
  private static orderStylesByPriority(styles: NeStyle[]): NeStyle[] {
    return styles.sort((a, b) => (a.priority < b.priority) ? -1 : 1);
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
        appliedTo: [],
        priority: map.priority
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
    network.style = DataService.orderStylesByPriority(styles); // todo order accordingly
    network.elements = elements;

    const newlyGroupedMappings = this.updateMappings(discreteMapping, network.mappings);

    if (isNode) {
      network.mappings.nodesDiscrete = network.mappings.nodesDiscrete.concat(newlyGroupedMappings);

      for (const akv of network.aspectKeyValuesNodes) {
        if (akv.name === discreteMapping[0].colHR) {
          akv.mapPointerD.push(network.mappings.nodesDiscrete.length - 1);
        }
      }

    } else {
      network.mappings.edgesDiscrete = network.mappings.edgesDiscrete.concat(newlyGroupedMappings);

      for (const akv of network.aspectKeyValuesEdges) {
        if (akv.name === discreteMapping[0].colHR) {
          akv.mapPointerD.push(network.mappings.edgesDiscrete.length - 1);
        }
      }
    }

    this.networksParsed = this.networksParsed.filter(x => x.id !== id).concat(network);
  }

  private updateMappings(discreteMapping: NeMappingsDefinition[], mappings: NeMappingsMap): NeGroupedMappingsDiscrete[] {

    const groupedMappings: NeGroupedMappingsDiscrete[] = [];

    if (!mappings) {
      return groupedMappings;
    }

    outer: for (const map of discreteMapping) {
      for (const gm of groupedMappings) {
        if (gm.classifier === map.colHR) {
          continue outer;
        }
      }
      groupedMappings.push({
        classifier: map.colHR,
        values: [],
        styleMap: [],
        th: [],
        selectors: []
      });
    }

    for (const map of discreteMapping) {
      for (const gm of groupedMappings) {

        if (gm.classifier === map.colHR) {
          let found = false;
          for (const style of gm.styleMap) {
            if (style.cssKey === map.cssKey) {
              found = true;
              if (!style.selectors.includes(map.selector)) {
                style.cssValues.push(map.cssValue);
                style.selectors.push(map.selector);
                if (!gm.selectors.includes(map.selector)) {
                  gm.selectors.push(map.selector);
                }
              }
            }
          }

          if (!found) {
            gm.th.push(map.cssKey);

            if (!gm.selectors.includes(map.selector)) {
              gm.selectors.push(map.selector);
            }
            gm.styleMap.push({
              cssKey: map.cssKey,
              cssValues: [map.cssValue],
              selectors: [map.selector]
            });
          }

          if (!gm.values.includes(map.isHR)) {
            gm.values.push(map.isHR);
          }
        }
      }
    }

    return groupedMappings;

  }
}
