import {NeMappingDiscrete} from './ne-mapping-discrete';
import {NeMappingContinuous} from './ne-mapping-continuous';
import {NeMapping} from './ne-mapping';
import {NeKeyValue} from './ne-key-value';

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
  nodesPassthrough: NeMapping[];

  /**
   * Collection of passthrough edge mappings
   */
  edgesPassthrough: NeMapping[];

  /**
   * Simple list of default styles applied to nodes
   */
  nodesPropertiesDefault: NeKeyValue[];

  /**
   * Simple list of default styles applied to edges
   */
  edgesPropertiesDefault: NeKeyValue[];
  /**
   * Simple list of default styles applied to specific nodes
   */
  nodesPropertiesSpecific: NeKeyValue[];
  /**
   * Simple list of default styles applied to specific edges
   */
  edgesPropertiesSpecific: NeKeyValue[];

  /**
   * Simple list of default styles applied to the network
   */
  networkDefault: NeKeyValue[];
}
