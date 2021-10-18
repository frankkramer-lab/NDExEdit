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
   * Lower border normalised
   */
  fromNormed: string;
  /**
   * Upper border
   */
  to: number;

  /**
   * Upper border normalised
   */
  toNormed: string;
  /**
   * List of values within those borders
   */
  values: number[];
}
