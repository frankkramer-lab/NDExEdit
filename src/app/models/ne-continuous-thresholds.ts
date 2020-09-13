import {NeThresholdMap} from './ne-threshold-map';
import {NeAspect} from './ne-aspect';

/**
 * Newly created continuous mapping
 */
export interface NeContinuousThresholds {

  /**
   * Name of style property
   */
  cssKey?: string;

  /**
   * Attribute by which this mapping is created
   */
  mappedProperty?: NeAspect;

  /**
   * Default value for all lower values
   */
  defaultLower?: string;

  /**
   * Default value for all greater values
   */
  defaultGreater?: string;

  /**
   * List of thresholds
   */
  breakpoints?: NeThresholdMap[];
}
