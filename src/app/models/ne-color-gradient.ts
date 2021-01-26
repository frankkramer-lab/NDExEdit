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
   * Contains attribute by which the color is mapped and the style property to which the color applies, e.g. ["correlation", "line-color"]
   */
  title?: string[];

  /**
   * Numeric threshold needed for calculation of the offset in percent
   */
  numericThreshold: string;
}
