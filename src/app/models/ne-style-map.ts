/**
 * A style property and their values and selectors
 */
export interface NeStyleMap {

  /**
   * This style's key
   */
  cssKey: string;

  /**
   * List of values
   */
  cssValues: string[];

  /**
   * List of selectors
   */
  selectors?: string[];

  /**
   * True, if mapped cssKey is a color property
   */
  isColor?: boolean;
}
