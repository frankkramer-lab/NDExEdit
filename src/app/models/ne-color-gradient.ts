/**
 * Color gradient for displaying continuous color mappings
 */
export interface NeColorGradient {
  /**
   * Color value in hexadecimal notation, e.g. #ff00ff
   */
  color: string;

  /**
   * Offset in percent to display the threshold respectively, where 0% is the left border and 100% is the right border
   */
  offset: string;
  /**
   * Only contains numeric values for calculating the offsetInterval
   */
  numericOffset: number;

  /**
   * Offset to previous threshold, translates to padding-left
   */
  offsetInterval: string;

  /**
   * Numeric threshold needed for calculation of the offset in percent
   */
  numericThreshold: string;
}
