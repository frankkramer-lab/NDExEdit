/**
 * Basetype for {@link NeNode} and {@link NeEdge}
 */
export interface NeElement {
  /**
   * Needs to be unique within the graph
   */
  id: string;

  /**
   * Used as label
   */
  name?: string;

  /**
   * Possibly links corresponding information on medical databases,
   * see {@link https://home.ndexbio.org/data-model/|CX data model} for further details
   */
  reference?: string;

  /**
   * Can be one of the following:
   * <ul>
   *   <li><b>nodes</b>: if the elements are of type {@link NeNode}</li>
   *   <li><b>edges</b>: if the elements are of type {@link NeEdge}</li>
   * </ul>
   */
  group: string;

  /**
   * An element's list of attributes
   */
  classes?: string[];
}
