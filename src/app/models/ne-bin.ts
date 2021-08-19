/**
 * Describes a bin used for calculating histograms.
 * A bin has to have a lower and upper border and values which lie within those thresholds
 */
export interface NeBin {
  /**
   * Lower border
   */
  from: number;
  /**
   * Upper border
   */
  to: number;
  /**
   * List of values within those borders
   */
  values: number[];
}
