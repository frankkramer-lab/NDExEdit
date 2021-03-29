import {NeElement} from './ne-element';
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

  numericValues?: number[];

  /**
   * Type of attribute
   */
  datatype?: string;

  /**
   * List of continuous mappings for this attribute
   */
  mapPointerC?: string[];

  /**
   * List of discrete mappings for this attribute
   */
  mapPointerD?: string[];

  /**
   * List of passthrough mappings for this attribute
   */
  mapPointerP?: string[];

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
