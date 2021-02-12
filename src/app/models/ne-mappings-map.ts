import {NeGroupedMappingsDiscrete} from './ne-grouped-mappings-discrete';
import {NeContinuousCollection} from './ne-continuous-collection';
import {NeMappingDiscrete} from "./ne-mapping-discrete";
import {NeMappingContinuous} from "./ne-mapping-continuous";

/**
 * Collection of all types of mappings
 */
export interface NeMappingsMap {

  /**
   * Collection of discrete node mappings
   */
  nodesDiscrete: NeMappingDiscrete[];

  /**
   * Collection of discrete edge mappings
   */
  edgesDiscrete: NeMappingDiscrete[];

  /**
   * Collection of continuous node mappings
   */
  nodesContinuous: NeMappingContinuous[];

  /**
   * Collection of continuous edge mappings
   */
  edgesContinuous: NeMappingContinuous[];
}
