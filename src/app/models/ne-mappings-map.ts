import {NeGroupedMappingsDiscrete} from './ne-grouped-mappings-discrete';
import {NeContinuousCollection} from "./ne-continuous-collection";

/**
 * Collection of all types of mappings
 */
export interface NeMappingsMap {

  /**
   * Collection of discrete node mappings
   */
  nodesDiscrete: NeGroupedMappingsDiscrete[];

  /**
   * Collection of discrete edge mappings
   */
  edgesDiscrete: NeGroupedMappingsDiscrete[];

  /**
   * Collection of continuous node mappings
   */
  nodesContinuous: any;

  /**
   * Collection of continuous edge mappings
   */
  edgesContinuous: any;
}
