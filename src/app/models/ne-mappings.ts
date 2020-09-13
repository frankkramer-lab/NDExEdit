/**
 * Mapping in CX data format
 */
export interface NeMappings {
  /**
   * Name of mapped property
   */
  key: string;

  /**
   * complex definition string
   */
  definition: string;

  /**
   * Type of mapping, can either be "CONTINUOUS", "DISCRETE" or "PASSTHROUGH"
   */
  type: string;
}
