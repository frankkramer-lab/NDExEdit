import {NeChart} from './ne-chart';
import {NeColorGradient} from './ne-color-gradient';
import {NeMapping} from './ne-mapping';

/**
 * Format for a continuous mapping
 */
export interface NeMappingContinuous extends NeMapping {
  /**
   * Type of data which is mapped, should be double, long, or integer
   * to be a valid continuous mapping.
   * List of available types: {@link https://home.ndexbio.org/data-model/#data_types}
   */
  type?: string;
  /**
   * List of lower values for this style property on the specified index
   */
  lowers: (string | number)[];
  /**
   * List of greater values for this style property on the specified index
   */
  greaters: (string | number)[];
  /**
   * List of equal values for this style property on the specified index
   */
  equals: (string | number)[];
  /**
   * List of the thresholds
   */
  thresholds: number[];
  /**
   * If any threshold has more than one assigned value,
   * all duplicates are listed here on the corresponding index.
   * Has to have the same length as {@link thresholds}
   */
  duplicates: any[];
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
