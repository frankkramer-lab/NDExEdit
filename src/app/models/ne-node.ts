import {NeElement} from './ne-element';

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
  classes?: string[];
}
