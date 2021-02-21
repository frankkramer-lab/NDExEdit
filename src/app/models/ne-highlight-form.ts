import {NeAspect} from './ne-aspect';

/**
 * Base type for inspect tool
 */
export interface NeHighlightForm {
  /**
   * Either 'node' or 'edge'
   */
  type: string;
  /**
   * An element's attribute, whose values and distribution the user wants to inspect
   */
  property: NeAspect;
  /**
   * Lower bound for inspections like 'Display elements with values between 5 and 25'.
   * Only valid for numeric properties.
   */
  rangeLower?: number;
  /**
   * Upper bound for inspections like 'Display elements with values between 5 and 25'.
   * Only valid for numeric properties.
   */
  rangeUpper?: number;
  /**
   * Comparing value for inspections like 'Display elements with values same as <value>'
   */
  sameAs?: string;

}
