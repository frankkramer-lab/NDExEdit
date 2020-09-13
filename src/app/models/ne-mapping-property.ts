/**
 * Represents a property within a discrete mapping
 */
export interface NeMappingProperty {
  /**
   * Pointer to the discrete node or edge mapping within the list of discrete node or edge mappings
   */
  mapReference: number;

  /**
   * Name of the attribute which specifies the property
   */
  attributeName: string;

  /**
   * Type of mapping, starting with n indicates it's a discrete node mapping
   */
  mapType: string;

  /**
   * Style object belonging to the line of mapping
   */
  style?: any;
}
