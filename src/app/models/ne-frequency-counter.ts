/**
 * Indicates how often a value is occuring
 * Used in the histogram context
 */
export interface NeFrequencyCounter {
  /**
   * Value whose occurance is counted
   */
  instance: string|number;

  /**
   * Counter
   */
  occurance: number;
}
