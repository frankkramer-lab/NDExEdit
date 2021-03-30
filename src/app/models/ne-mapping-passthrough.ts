/**
 * Simplest type of mapping
 */
export interface NeMappingPassthrough {
  /**
   * Points to the data column
   */
  col: string;
  /**
   * Points to the style property which is filled by {@link col}'s data
   */
  styleProperty: string;
}
