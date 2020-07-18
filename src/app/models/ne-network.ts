import {NeNetworkInformation} from './ne-network-information';
import * as cytoscape from 'cytoscape';
import {ElementDefinition, Stylesheet} from 'cytoscape';
import {NeElement} from './ne-element';
import {NeElementAttribute} from './ne-element-attribute';
import {NeAspect} from './ne-aspect';
import {NeGlobalMappings} from './ne-global-mappings';

export interface NeNetwork {
  id?: number;
  elements: ElementDefinition[];
  style: Stylesheet[] | any[];
  networkInformation?: NeNetworkInformation;
  nodeCount?: number;
  edgeCount?: number;
  cssClassCount?: number;
  graph?: cytoscape.Core;
  aspects?: NeElementAttribute[];
  aspectKeyValues?: NeAspect[];
  mappings?: any;
}
