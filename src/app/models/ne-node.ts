import {NeElement} from './ne-element';
import {NeElementAttribute} from './ne-element-attribute';
import {NePosition} from './ne-position';

/**
 * Type based on {@link NeElement} describing nodes
 */
export interface NeNode extends NeElement {

  /**
   * {@inheritdoc}
   */
  id: string;

  /**
   * {@inheritdoc}
   */
  group: string;

  /**
   * {@inheritdoc}
   */
  name: string;

  /**
   * {@inheritdoc}
   */
  reference?: string;

  /**
   * {@inheritdoc}
   */
  attributes?: NeElementAttribute[];

  /**
   * Coordinates specified within a
   * {@link http://www.cut-the-knot.org/Curriculum/Calculus/Coordinates.shtml|cartesian layout}
   */
  position?: NePosition;

  /**
   * {@inheritdoc}
   */
  classes?: string[];
}
