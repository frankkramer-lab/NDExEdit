/**
 * Format of a discrete mapping
 */
import {NeMapping} from './ne-mapping';

export interface NeMappingDiscrete extends NeMapping {
  /**
   * Type of data which is mapped, should be string (default) or boolean
   * to be a valid discrete mapping.
   * List of available types: {@link https://home.ndexbio.org/data-model/#data_types}
   */
  type: string;
  /**
   * List of keys defining a discrete threshold, e.g. "protein" for property "type" of a node
   */
  keys: string[];
  /**
   * Applied value for the key in keys, e.g. "#ff0000" for NODE_FILL_COLOR, when "type" of a node is "protein".
   * Thus keys and values always need to be of the same length to cross reference correctly
   */
  values: string[];

  /**
   * Contains a mapping association of the form {"RNA":"#ff0000"}
   */
  mapObject: any;

}
