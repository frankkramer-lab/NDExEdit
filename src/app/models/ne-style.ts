import {NeElement} from './ne-element';

/**
 * Style object
 */
export interface NeStyle {

  /**
   * Corresponding selector
   */
  selector: string;

  /**
   * Style object containing key and value
   */
  style?: any;

  /**
   * List of elements to which this style was applied to
   */
  appliedTo?: NeElement[];

  /**
   * This style's priority based on its specifity
   */
  priority?: number;
}
