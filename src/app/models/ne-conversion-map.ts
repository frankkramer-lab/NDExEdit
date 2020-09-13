import {NeConversionDetails} from './ne-conversion-details';

/**
 * Base object for lookup file structure
 */
export interface NeConversionMap {

  /**
   * List of NDEx keys
   */
  ndex: string[];

  /**
   * List of Cytoscape.js keys
   */
  cytoscape: string[];

  /**
   * Specific selector, e.g. ':selected'
   */
  selector?: string;

  /**
   * Type of conversion, can either be 'split' or 'method'
   */
  conversionType?: string;

  /**
   * Contains objects for NDEx and Cytoscape.js properties
   */
  conversion?: any[];

  /**
   * For conversion of type 'split' the splitRules define the corresponding rules
   */
  splitRules?: NeConversionDetails;

  /**
   * Evaluated parts are matched according to this lookup
   */
  matchRules?: any;
}
