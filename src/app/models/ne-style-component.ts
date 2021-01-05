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
   * This style's priority, specific implementation can be found in {@link UtilityService#utilFindPriorityBySelector}
   * <ul>
   *   <li><b>0</b>: Default styles for nodes or edges</li>
   *   <li><b>1</b>: Aspect specific, e.g. a class applied to any element with type protein, discrete mappings</li>
   *   <li><b>2</b>: Element specific, e.g. continuous mappings</li>
   *   <li><b>3</b>: Special selectors, e.g. :selected which need to override existing selectors</li>
   *   <li><b>4</b>: Utility styles, e.g. custom_highlight_color used to highlight an element quickly, needs to override anything</li>
   * </ul>
   */
  priority: number;
}
