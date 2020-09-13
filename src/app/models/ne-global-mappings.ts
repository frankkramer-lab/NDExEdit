import {NeMappingsDefinition} from './ne-mappings-definition';
import {NeContinuousCollection} from './ne-continuous-collection';

/**
 * Collection of discrete and continuous mappings
 */
export interface NeGlobalMappings {

  /**
   * List of discrete mappings
   */
  discrete?: NeMappingsDefinition[];

  /**
   * List of continuous mappings
   */
  continuous?: NeContinuousCollection[];
}
