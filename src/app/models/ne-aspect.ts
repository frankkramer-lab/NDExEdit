import {NeChart} from './ne-chart';

/**
 * Represents a collection of useful associations to an attribute
 */
export interface NeAspect {

  /**
   * Name of the attribute
   */
  name: string;

  /**
   * The attribute's possible values
   */
  values: string[];

  /**
   * List of numeric values needed, if the datatype of this aspect is double or int
   */
  numericValues?: number[];

  /**
   * Type of attribute
   */
  datatype?: string;

  /**
   * Distribution chart for discrete properties
   */
  chartDiscreteDistribution?: NeChart;

  /**
   * Distribution chart for continuous properties
   */
  chartContinuousDistribution?: NeChart;

  /**
   * Minimum for numeric values
   */
  min?: number;

  /**
   * Maximum for numeric values
   */
  max?: number;

  /**
   * Initial size of bins for histogram distribution
   */
  binSize?: number;

  /**
   * True, if this aspect may be used for a continuous mapping and has a histogram distribution
   */
  validForContinuous?: boolean;

  /**
   * Indicates how many fitting elements have this aspect, e.g. 10 nodes in a network, 9 of which have aspect "A" results in 90% coverage.
   * This value is always between 0 and 100.
   */
  coverage?: string;
}
