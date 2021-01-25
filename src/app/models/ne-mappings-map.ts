import {NeGroupedMappingsDiscrete} from './ne-grouped-mappings-discrete';
import {NeContinuousCollection} from './ne-continuous-collection';
import {NeMappingDiscrete} from "./ne-mapping-discrete";

/**
 * Collection of all types of mappings
 */
export interface NeMappingsMap {

  /**
   * Collection of discrete node mappings
   */
  nodesDiscrete: NeGroupedMappingsDiscrete[] | NeMappingDiscrete[];

  /**
   * Collection of discrete edge mappings
   */
  edgesDiscrete: NeGroupedMappingsDiscrete[] | NeMappingDiscrete[];

  /**
   * Collection of continuous node mappings
   */
  nodesContinuous: NeContinuousCollection[];

  /**
   * Collection of continuous edge mappings
   */
  edgesContinuous: NeContinuousCollection[];
}
