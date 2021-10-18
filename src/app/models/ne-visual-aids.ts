import {NeVisualAid} from './ne-visual-aid';

/**
 * List of visual aids for a mapping collection.
 */
export interface NeVisualAids {
  /**
   * Histogram for this mapping collection's column
   */
  histogram: NeVisualAid;

  /**
   * Each style property within this mapping collection is represented as a key.
   * Such a key contains a visual aid object that contains the suitable visual aid for this style property
   */
  [key: string]: NeVisualAid;
}
