import {MappingType} from '../services/utility.service';

export interface NeMapping {
  /**
   * Column of a node's or edge's property whose values are mapped
   */
  col: string;
  /**
   * Style property which is applied, e.g. 'NODE_FILL_COLOR'
   * These have to be interpretable by CX, because we render by converting CX to Cytoscape.js
   */
  styleProperty: string;
  /**
   * Type of mapping, can either be continuous, discrete or passthrough
   */
  mappingType: MappingType;
  /**
   * Contains if the corresponding value within threshold list is to be used for a mapping,
   * only applies to discrete and continuous mappings.
   */
  useValue: boolean[];

  /**
   * Only true if this mapping is the first in a new collection to this col
   */
  newlyAdded: boolean;
}
