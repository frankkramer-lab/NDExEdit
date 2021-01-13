/**
 * Indicates how often a value is occuring
 * Used in the histogram context
 */
export interface NeFrequencyCounter {
  /**
   * Lower border is needed as value to be counted
   */
  lowerBorder: string|number;

  /**
   * Optionally add an upper border to indicate end of interval
   */
  upperBorder?: string|number;

  /**
   * Counter
   */
  occurance: number;
}
