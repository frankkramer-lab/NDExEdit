import {NeElement} from './ne-element';
import {NeElementAttribute} from './ne-element-attribute';

/**
 * Type based on {@link NeElement} describing edges
 */
export interface NeEdge extends NeElement {

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
   * id of the edge's source node, needs to refer to a {@link NeNode#id|NeNode's id}
   */
  source: string;

  /**
   * if of the edge's target node, needs to refer to a {@link NeNode#id|NeNode's id}
   */
  target: string;

  /**
   * {@inheritdoc}
   */
  attributes?: NeElementAttribute[];

  /**
   * {@inheritdoc}
   */
  classes?: string[];
}
