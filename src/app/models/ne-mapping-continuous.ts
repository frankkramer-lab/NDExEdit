import {NeChart} from './ne-chart';
import {NeColorGradient} from './ne-color-gradient';

/**
 * Format for a continuous mapping
 */
export interface NeMappingContinuous {
  /**
   * Column of a node's or edge's property whose values are mapped
   */
  col: string;
  /**
   * Style property which is applied, e.g. 'NODE_FILL_COLOR'
   * These have to be interpretable by CX, because we render by converting CX to Cytoscape.js
   */
  styleProperty: string;
  /**
   * Style property without redundant prefix 'NODE_' or 'EDGE_'
   */
  cleanStyleProperty?: string;
  /**
   * Type of data which is mapped, should be double, long, or integer
   * to be a valid continuous mapping.
   * List of available types: {@link https://home.ndexbio.org/data-model/#data_types}
   */
  type?: string;
  /**
   * List of lower values for this style property on the specified index
   */
  lowers: number[] | string[];
  /**
   * List of greater values for this style property on the specified index
   */
  greaters: number[] | string[];
  /**
   * List of equal values for this style property on the specified index
   */
  equals: number[] | string[];
  /**
   * List of the thresholds
   */
  thresholds: number[] | string[];
  /**
   * Chart data visualising the mapping
   */
  chart: NeChart;
  /**
   * Color gradient info if the styleProperty can be interpreted as color
   */
  colorGradient: NeColorGradient[];
  /**
   * True, if this mapping applies to a color property
   */
  isColor: boolean;
}
