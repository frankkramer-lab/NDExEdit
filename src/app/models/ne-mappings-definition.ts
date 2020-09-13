/**
 * Disassembled definition string representing a mapping
 */
export interface NeMappingsDefinition {

  /**
   * Mapped property, which is called "col" (as in column) in Cytoscape, without whitespace or round brackets
   */
  col: string;

  /**
   * Human readable col property
   */
  colHR: string;

  /**
   * Value of the specified col, without whitespace or round brackets
   */
  is: string;

  /**
   * Human readable is property
   */
  isHR: string;

  /**
   * Selector matching this mapped value
   */
  selector: string;

  /**
   * Style key
   */
  cssKey?: string;

  /**
   * Style value
   */
  cssValue?: string;

  /**
   * Priority of this style is determined by the specifity of this mapping, e.g. mappings applying to all nodes of type "drug" are
   * not as specific as mappings applying to the node with ID 1.
   */
  priority: number;

  /**
   * Datatype for this mapping
   */
  datatype?: string;
}
