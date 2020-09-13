import {NeContinuousChart} from './ne-continuous-chart';
import {NeStyleComponent} from './ne-style-component';
import {NeColorGradient} from './ne-color-gradient';

/**
 * Aggregates information about continuous mappings
 */
export interface NeContinuousCollection {

  /**
   * Chart information for non-color continuous mappings
   */
  chart?: NeContinuousChart;

  /**
   * Values of this continuous mapping
   */
  values?: NeStyleComponent[];

  /**
   * Indicates if the chart is to be displayed, otherwise the gradient is displayed
   */
  displayChart?: boolean;

  /**
   * Color gradient information for color continous mappings
   */
  colorGradient?: NeColorGradient[];

  /**
   * Indicates if the chart is valid
   */
  chartValid?: boolean;

  /**
   * Indicates if the gradient is valid
   */
  gradientValid?: boolean;

  /**
   * Contains attribute by which the color is mapped and the style property to which the color applies, e.g. ["correlation", "width"]
   */
  title?: string[];

  /**
   * Selector for this mapping
   */
  selector?: string;
}
