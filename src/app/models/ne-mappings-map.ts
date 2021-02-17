import {NeMappingDiscrete} from "./ne-mapping-discrete";
import {NeMappingContinuous} from "./ne-mapping-continuous";
import {NeMappingPassthrough} from "./ne-mapping-passthrough";

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

  /**
   * Collection of passthrough node mappings
   */
  nodesPassthrough: NeMappingPassthrough[];

  /**
   * Collection of passthrough edge mappings
   */
  edgesPassthrough: NeMappingPassthrough[];
}
