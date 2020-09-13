import {NeStyleMap} from './ne-style-map';

/**
 * Collection of discrete Mappings
 */
export interface NeGroupedMappingsDiscrete {

  /**
   * Classifier of this mapping, e.g. "type"
   */
  classifier: string;

  /**
   * List of all values included in this mapping, e.g. ["drug", "protein"]
   */
  values: string[];

  /**
   * Collection of corresponding styles
   */
  styleMap: NeStyleMap[];

  /**
   * List of table headers for displaying the mapping within sidebar
   */
  th: string[];

  /**
   * List of corresponding selectors
   */
  selectors: string[];

  /**
   * Datatype of mapping
   */
  datatype?: string;
}
