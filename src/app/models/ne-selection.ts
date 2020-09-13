import {NeEdge} from './ne-edge';
import {NeNode} from './ne-node';

/**
 * Represents all currently selected objects in the rendered graph
 */
export interface NeSelection {

  /**
   * List of currently selected nodes
   */
  nodes: NeNode[];

  /**
   * List of currently selected edges
   */
  edges: NeEdge[];
}
