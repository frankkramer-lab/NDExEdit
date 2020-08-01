import {NeNetworkInformation} from './ne-network-information';
import * as cytoscape from 'cytoscape';
import {ElementDefinition, Stylesheet} from 'cytoscape';
import {NeElementAttribute} from './ne-element-attribute';
import {NeAspect} from './ne-aspect';
import {NeMappingsMap} from './ne-mappings-map';

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
  aspectKeyValuesNodes?: NeAspect[];
  aspectKeyValuesEdges?: NeAspect[];
  mappings?: NeMappingsMap;
  styleConstants?: any;
}
