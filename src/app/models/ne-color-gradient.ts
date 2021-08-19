/**
 * Color gradient for displaying continuous color mappings
 */
export interface NeColorGradient {
  /**
   * Color value in hexadecimal notation, e.g. #ff00ff
   */
  color: string;
  /**
   * To display the threshold overlay in a contrasting color
   * Each threshold has to have a contrast color
   */
  contrastColor: string;
  /**
   * If the greyscale value of this color is too dark (50%), the label's text needs to be white.
   * Defaults to false
   */
  labelColorWhite: boolean;
  /**
   * Offset in percent to display the threshold respectively, where 0% is the left border and 100% is the right border
   */
  offset: string;

  /**
   * Discrepancy between two offsets
   */
  offsetInterval: string;

  /**
   * Numeric representation of an offset
   */
  numericOffset: number;

  /**
   * Numeric threshold needed for calculation of the offset in percent
   */
  numericThreshold: string;

  /**
   * True, if this threshold is selected within the gradient preview
   */
  selected: boolean;
}
