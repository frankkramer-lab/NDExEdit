import {NeNetworkInformation} from './ne-network-information';
import {Core, ElementDefinition, Stylesheet} from 'cytoscape';
import {NeAspect} from './ne-aspect';
import {NeMappingsMap} from './ne-mappings-map';

/**
 * Represents a network ready for rendering within NDExEdit
 */
export interface NeNetwork {

  /**
   * The network's internal ID
   */
  id: number;

  /**
   * Contains the original NDEx data as JSON.
   * Essential for conversion by library
   */
  cx: any[];

  /**
   * Name of original file
   */
  filename?: string;

  /**
   * Core object which can be rendered
   */
  core: Core;

  /**
   * List of nodes and edges
   */
  elements?: ElementDefinition[];

  /**
   * Stylesheet
   */
  style?: Stylesheet[] | any[];

  /**
   * Information about this network
   */
  networkInformation: NeNetworkInformation;

  /**
   * List of all attributes for nodes and their associations to other objects
   */
  aspectKeyValuesNodes?: NeAspect[];

  /**
   * List of all attributes for edges and their associations to other objects
   */
  aspectKeyValuesEdges?: NeAspect[];

  /**
   * List of all mappings
   */
  mappings: NeMappingsMap;

  /**
   * List of style constants, e.g. "arrow color same as edge"
   */
  styleConstants?: any;

  /**
   * Indicates if the labels are visible or not
   */
  showLabels?: boolean;

  /**
   * Stores the initial layout for this network so users can return to preset layout
   */
  initialLayout: any[];

}
