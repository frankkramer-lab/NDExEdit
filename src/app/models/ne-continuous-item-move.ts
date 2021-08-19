/**
 * Cells within a continuous mapping are movable within the mapping
 */
export interface NeContinuousItemMove {
  /**
   * Points to the mapping within a collection of continuous mappings
   */
  mappingIndex: number;
  /**
   * Points to the originally assigned threshold
   */
  sourceThresholdIndex: number;
  /**
   * Points to the newly assigned threshold
   */
  targetThresholdIndex?: number;
  /**
   * Points to the duplicate in the list of duplicates for this threshold,
   * if the item to be moved is a duplicate
   */
  duplicateIndex?: number;
}
