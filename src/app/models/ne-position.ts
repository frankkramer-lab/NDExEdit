/**
 * Type for {@link http://www.cut-the-knot.org/Curriculum/Calculus/Coordinates.shtml|cartesian layout}
 */
export interface NePosition {

  /**
   * References a {@link NeNode#id|node's id}
   */
  reference: string;

  /**
   * x dimension
   */
  x: number;

  /**
   * y dimension
   */
  y: number;
}
