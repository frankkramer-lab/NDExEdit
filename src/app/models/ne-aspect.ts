import {NeElement} from './ne-element';

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
   * List of element containing this attribute
   */
  appliedTo?: NeElement[];

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
   * Distribution chart for discrete properties
   */
  chartDiscreteDistribution?: any;

  /**
   * Distribution chart for continuous properties
   */
  chartContinuousDistribution?: any;

  /**
   * Minimum for numeric values
   */
  min?: number;

  /**
   * Maximum for numeric values
   */
  max?: number;
}
