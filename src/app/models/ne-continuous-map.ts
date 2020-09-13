/**
 * Map to calculate relative values for a continuous mapping
 */
export interface NeContinuousMap {

  /**
   * Original value
   */
  inputValue: string;

  /**
   * Value of previous threshold
   */
  lower?: string;

  /**
   * Previous threshold
   */
  lowerThreshold?: string;

  /**
   * Value of next threshold
   */
  greater?: string;

  /**
   * Next threshold
   */
  greaterThreshold?: string;
}
