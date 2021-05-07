/**
 * Format of a discrete mapping
 */
export interface NeMappingDiscrete {
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
   * True if a set value is to be set.
   * Used to exclude a color value defined by color picker, because there's no such thing as 'null' for color pickers
   */
  useValue: boolean[];
}
