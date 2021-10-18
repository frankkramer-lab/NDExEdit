/**
 * For representation purposes, we condense all mapped properties into this model.
 * It can hold multiple string keys each containing a list of the assigned values.
 * Note: The lists of assigned values have to be the same length.
 */
export interface NeMappingDiscreteAggregation {
  /**
   * List of keys within this object
   */
  keys: string[];

  /**
   * For each key a string array holds the assigned values
   */
  [key: string]: string[];
}
