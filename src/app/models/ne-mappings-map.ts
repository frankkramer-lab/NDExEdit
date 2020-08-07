import {NeGroupedMappingsDiscrete} from './ne-grouped-mappings-discrete';

export interface NeMappingsMap {
  nodesDiscrete: NeGroupedMappingsDiscrete[];
  edgesDiscrete: NeGroupedMappingsDiscrete[];
  nodesContinuous: any;
  edgesContinuous: any;
}
