import {NeAspect} from './ne-aspect';
import {ElementType, InspectionRuleType} from '../services/utility.service';

/**
 * Base type for inspect tool
 */
export interface NeHighlightForm {
  /**
   * Either 'node' or 'edge'
   */
  elementType: ElementType;

  /**
   * Either 'numeric', 'bool' or 'text'
   */
  ruleType: InspectionRuleType;
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

  /**
   * True, if this element is to be deleted.
   * Needs confirmation by the user
   */
  markedForDeletion: boolean;

}
