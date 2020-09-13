/**
 * Yet uncollapsed style object, containing separate key and value
 */
export interface NeStyleComponent {

  /**
   * This style's selector
   */
  selector: string;

  /**
   * This style's key
   */
  cssKey?: string;

  /**
   * This style's value
   */
  cssValue?: string;

  /**
   * This style's priority
   */
  priority: number;
}
