import {NeNetworkInformation} from './ne-network-information';
import * as cytoscape from 'cytoscape';
import {ElementDefinition, Stylesheet} from 'cytoscape';
import {NeElementAttribute} from './ne-element-attribute';
import {NeAspect} from './ne-aspect';
import {NeMappingsMap} from './ne-mappings-map';

/**
 * Represents a network ready for rendering within NDExEdit
 */
export interface NeNetwork {

  /**
   * The network's internal ID
   */
  id?: number;

  /**
   * List of nodes and edges
   */
  elements: ElementDefinition[];

  /**
   * Stylesheet
   */
  style: Stylesheet[] | any[];

  /**
   * Information about this network
   */
  networkInformation?: NeNetworkInformation;

  /**
   * Core object which can be rendered
   */
  graph?: cytoscape.Core;

  /**
   * List of all available attributes
   */
  aspects?: NeElementAttribute[];

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
  mappings?: NeMappingsMap;

  /**
   * List of style constants, e.g. "arrow color same as edge"
   */
  styleConstants?: any;

  /**
   * Indicates if the labels are visible or not
   */
  showLabels?: boolean;

}
