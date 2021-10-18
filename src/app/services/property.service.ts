import {Injectable} from '@angular/core';
import {ElementType, MappingType, UtilityService} from './utility.service';
import {NeAvailableProperty} from '../models/ne-available-property';
import {NeNetwork} from '../models/ne-network';
import {NeMapping} from '../models/ne-mapping';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  constructor(
    private utilityService: UtilityService
  ) {
  }

  /**
   * List of non-editable properties which are to be ignored in this context
   */
  static readonly irrelevantProperties = [
    'NODE_CUSTOMGRAPHICS_1',
    'NODE_CUSTOMGRAPHICS_2',
    'NODE_CUSTOMGRAPHICS_3',
    'NODE_CUSTOMGRAPHICS_4',
    'NODE_CUSTOMGRAPHICS_5',
    'NODE_CUSTOMGRAPHICS_6',
    'NODE_CUSTOMGRAPHICS_7',
    'NODE_CUSTOMGRAPHICS_8',
    'NODE_CUSTOMGRAPHICS_9',
    'NODE_CUSTOMGRAPHICS_POSITION_1',
    'NODE_CUSTOMGRAPHICS_POSITION_2',
    'NODE_CUSTOMGRAPHICS_POSITION_3',
    'NODE_CUSTOMGRAPHICS_POSITION_4',
    'NODE_CUSTOMGRAPHICS_POSITION_5',
    'NODE_CUSTOMGRAPHICS_POSITION_6',
    'NODE_CUSTOMGRAPHICS_POSITION_7',
    'NODE_CUSTOMGRAPHICS_POSITION_8',
    'NODE_CUSTOMGRAPHICS_POSITION_9',
    'NODE_CUSTOMGRAPHICS_SIZE_1',
    'NODE_CUSTOMGRAPHICS_SIZE_2',
    'NODE_CUSTOMGRAPHICS_SIZE_3',
    'NODE_CUSTOMGRAPHICS_SIZE_4',
    'NODE_CUSTOMGRAPHICS_SIZE_5',
    'NODE_CUSTOMGRAPHICS_SIZE_6',
    'NODE_CUSTOMGRAPHICS_SIZE_7',
    'NODE_CUSTOMGRAPHICS_SIZE_8',
    'NODE_CUSTOMGRAPHICS_SIZE_9',
    'NODE_CUSTOMPAINT_1',
    'NODE_CUSTOMPAINT_2',
    'NODE_CUSTOMPAINT_3',
    'NODE_CUSTOMPAINT_4',
    'NODE_CUSTOMPAINT_5',
    'NODE_CUSTOMPAINT_6',
    'NODE_CUSTOMPAINT_7',
    'NODE_CUSTOMPAINT_8',
    'NODE_CUSTOMPAINT_9'
  ];
  /**
   * List of known font face properties which need a special form
   */
  static readonly fontFaceProperties = [
    'NODE_LABEL_FONT_FACE',
    'EDGE_LABEL_FONT_FACE'
  ];
  /**
   * List of known edge properties
   */
  static readonly edgeProperties = [
    'EDGE_CURVED',
    'EDGE_LABEL_COLOR',
    'EDGE_LABEL_FONT_FACE',
    'EDGE_LABEL_FONT_SIZE',
    'EDGE_LABEL_TRANSPARENCY',
    'EDGE_LABEL_WIDTH',
    'EDGE_LINE_TYPE',
    'EDGE_PAINT',
    'EDGE_SELECTED',
    'EDGE_SELECTED_PAINT',
    'EDGE_SOURCE_ARROW_SELECTED_PAINT',
    'EDGE_SOURCE_ARROW_SHAPE',
    'EDGE_SOURCE_ARROW_SIZE',
    'EDGE_SOURCE_ARROW_UNSELECTED_PAINT',
    'EDGE_STROKE_SELECTED_PAINT',
    'EDGE_STROKE_UNSELECTED_PAINT',
    'EDGE_TARGET_ARROW_SELECTED_PAINT',
    'EDGE_TARGET_ARROW_SHAPE',
    'EDGE_TARGET_ARROW_SIZE',
    'EDGE_TARGET_ARROW_UNSELECTED_PAINT',
    'EDGE_TRANSPARENCY',
    'EDGE_UNSELECTED_PAINT',
    'EDGE_VISIBLE',
    'EDGE_WIDTH'
  ];
  /**
   * List of known node properties
   */
  static readonly nodeProperties = [
    'COMPOUND_NODE_PADDING',
    'COMPOUND_NODE_SHAPE',
    'NODE_BORDER_PAINT',
    'NODE_BORDER_STROKE',
    'NODE_BORDER_TRANSPARENCY',
    'NODE_BORDER_WIDTH',
    'NODE_DEPTH',
    'NODE_FILL_COLOR',
    'NODE_HEIGHT',
    'NODE_LABEL',
    'NODE_LABEL_COLOR',
    'NODE_LABEL_FONT_FACE',
    'NODE_LABEL_FONT_SIZE',
    'NODE_LABEL_POSITION',
    'NODE_LABEL_TRANSPARENCY',
    'NODE_LABEL_WIDTH',
    'NODE_NESTED_NETWORK_IMAGE_VISIBLE',
    'NODE_PAINT',
    'NODE_SELECTED',
    'NODE_SELECTED_PAINT',
    'NODE_SHAPE',
    'NODE_SIZE',
    'NODE_TRANSPARENCY',
    'NODE_VISIBLE',
    'NODE_WIDTH',
    'NODE_X_LOCATION',
    'NODE_Y_LOCATION',
    'NODE_Z_LOCATION'
  ];
  /**
   * List of known continuous properties
   */
  static readonly continuousProperties = [
    'COMPOUND_NODE_PADDING',
    'NODE_BORDER_PAINT',
    'NODE_BORDER_TRANSPARENCY',
    'NODE_BORDER_WIDTH',
    'NODE_DEPTH',
    'NODE_FILL_COLOR',
    'NODE_HEIGHT',
    'NODE_LABEL_COLOR',
    'NODE_LABEL_FONT_SIZE',
    'NODE_LABEL_TRANSPARENCY',
    'NODE_LABEL_WIDTH',
    'NODE_PAINT',
    'NODE_SELECTED',
    'NODE_SELECTED_PAINT',
    'NODE_SIZE',
    'NODE_TRANSPARENCY',
    'NODE_WIDTH',
    'NODE_X_LOCATION',
    'NODE_Y_LOCATION',
    'NODE_Z_LOCATION',
    'EDGE_LABEL_COLOR',
    'EDGE_LABEL_FONT_SIZE',
    'EDGE_LABEL_TRANSPARENCY',
    'EDGE_LABEL_WIDTH',
    'EDGE_PAINT',
    'EDGE_SELECTED',
    'EDGE_SELECTED_PAINT',
    'EDGE_SOURCE_ARROW_SELECTED_PAINT',
    'EDGE_SOURCE_ARROW_SIZE',
    'EDGE_SOURCE_ARROW_UNSELECTED_PAINT',
    'EDGE_STROKE_SELECTED_PAINT',
    'EDGE_STROKE_UNSELECTED_PAINT',
    'EDGE_TARGET_ARROW_SELECTED_PAINT',
    'EDGE_TARGET_ARROW_SIZE',
    'EDGE_TARGET_ARROW_UNSELECTED_PAINT',
    'EDGE_TRANSPARENCY',
    'EDGE_UNSELECTED_PAINT',
    'EDGE_WIDTH'
  ];
  /**
   * List of known color properties
   */
  static readonly colorProperties: string[] = [
    'NETWORK_BACKGROUND_PAINT',
    'NODE_BORDER_PAINT',
    'NODE_FILL_COLOR',
    'NODE_LABEL_COLOR',
    'NODE_PAINT',
    'NODE_SELECTED_PAINT',
    'EDGE_LABEL_COLOR',
    'EDGE_PAINT',
    'EDGE_SELECTED_PAINT',
    'EDGE_SOURCE_ARROW_SELECTED_PAINT',
    'EDGE_SOURCE_ARROW_UNSELECTED_PAINT',
    'EDGE_STROKE_SELECTED_PAINT',
    'EDGE_STROKE_UNSELECTED_PAINT',
    'EDGE_TARGET_ARROW_SELECTED_PAINT',
    'EDGE_TARGET_ARROW_UNSELECTED_PAINT',
    'EDGE_UNSELECTED_PAINT'
  ];
  /**
   * List of for mapping available style properties.
   * Note: A visual property should only be mapped once throughout the network
   */
  static availableStyleProperties: string[] = PropertyService.nodeProperties.concat(PropertyService.edgeProperties);
  /**
   * List of all available element properties that are currently available for mapping.
   * Note: A property can be used for two different types of mappings, but only once within a specific mapping type.
   */
  availableElementProperties: NeAvailableProperty = {
    node: {
      p: [],
      d: [],
      c: []
    },
    edge: {
      p: [],
      d: [],
      c: []
    }
  };

  /**
   * Initializes the list of available style properties by splicing out the already mapped visual properties.
   * @param mappings List of mappings
   * @private
   */
  private static initStylesByMappings(mappings: NeMapping[]): void {
    for (const mapping of mappings) {
      if (PropertyService.availableStyleProperties.includes(mapping.styleProperty)) {
        const index = PropertyService.availableStyleProperties.indexOf(mapping.styleProperty);
        PropertyService.availableStyleProperties.splice(index, 1);
      }
    }
  }

  /**
   * Initializes the lists within {@link availableElementProperties} and {@link availableStyleProperties}
   * based on the currently selected network
   * @param network Currently selected network
   */
  initAvailables(network: NeNetwork): void {
    // Add edge properties, that don't have a mapping yet
    for (const edgeProp of network.aspectKeyValuesEdges) {
      if (edgeProp.validForContinuous) {
        const cMappedIndex = network.mappings.edgesContinuous.findIndex(a => a.col === edgeProp.name);
        if (cMappedIndex === -1 && !this.availableElementProperties.edge.c.includes(edgeProp.name)) {
          this.availableElementProperties.edge.c.push(edgeProp.name);
        }
      }
      const dMappedIndex = network.mappings.edgesDiscrete.findIndex(a => a.col === edgeProp.name);
      const pMappedIndex = network.mappings.edgesPassthrough.findIndex(a => a.col === edgeProp.name);

      if (dMappedIndex === -1 && !this.availableElementProperties.edge.d.includes(edgeProp.name)) {
        this.availableElementProperties.edge.d.push(edgeProp.name);
      }

      if (pMappedIndex === -1 && !this.availableElementProperties.edge.p.includes(edgeProp.name)) {
        this.availableElementProperties.edge.p.push(edgeProp.name);
      }
    }

    // Add node properties, that don't have a mapping yet
    for (const nodeProp of network.aspectKeyValuesNodes) {
      if (nodeProp.validForContinuous) {
        const cMappedIndex = network.mappings.nodesContinuous.findIndex(a => a.col === nodeProp.name);
        if (cMappedIndex === -1 && !this.availableElementProperties.node.c.includes(nodeProp.name)) {
          this.availableElementProperties.node.c.push(nodeProp.name);
        }
      }
      const dMappedIndex = network.mappings.nodesDiscrete.findIndex(a => a.col === nodeProp.name);
      const pMappedIndex = network.mappings.nodesPassthrough.findIndex(a => a.col === nodeProp.name);
      if (dMappedIndex === -1 && !this.availableElementProperties.node.d.includes(nodeProp.name)) {
        this.availableElementProperties.node.d.push(nodeProp.name);
      }
      if (pMappedIndex === -1 && !this.availableElementProperties.node.p.includes(nodeProp.name)) {
        this.availableElementProperties.node.p.push(nodeProp.name);
      }
    }

    PropertyService.initStylesByMappings(network.mappings.nodesPassthrough);
    PropertyService.initStylesByMappings(network.mappings.nodesDiscrete);
    PropertyService.initStylesByMappings(network.mappings.nodesContinuous);
    PropertyService.initStylesByMappings(network.mappings.edgesPassthrough);
    PropertyService.initStylesByMappings(network.mappings.edgesDiscrete);
    PropertyService.initStylesByMappings(network.mappings.edgesContinuous);
  }

  /**
   * When a new mapping collection is added, we remove its corresponding data column from the list of
   * {@link availableElementProperties}.
   *
   * @param elementType Type of element
   * @param mappingType Type of mapping
   * @param property Name of the column
   */
  handleMappingAdded(elementType: ElementType, mappingType: MappingType, property: string): void {

    const elementTypeKey = elementType === this.utilityService.elementType.node ? 'node' : 'edge';
    const mappingTypeKey = mappingType === this.utilityService.mappingType.passthrough ? 'p'
      : (mappingType === this.utilityService.mappingType.discrete ? 'd' : 'c');

    const index = this.availableElementProperties[elementTypeKey][mappingTypeKey].indexOf(property);
    if (index > -1) {
      this.availableElementProperties[elementTypeKey][mappingTypeKey].splice(index, 1);
    }
  }

  /**
   * When a mapping collection is remove, we add its corresponding data column to the list of
   * {@link availableElementProperties}.
   *
   * @param elementType Type of element
   * @param mappingType Type of mapping
   * @param property Name of the column
   */
  handleMappingRemoved(elementType: ElementType, mappingType: MappingType, property: string): void {

    const elementTypeKey = elementType === this.utilityService.elementType.node ? 'node' : 'edge';
    const mappingTypeKey = mappingType === this.utilityService.mappingType.passthrough ? 'p'
      : (mappingType === this.utilityService.mappingType.discrete ? 'd' : 'c');

    if (!this.availableElementProperties[elementTypeKey][mappingTypeKey].includes(property)) {
      this.availableElementProperties[elementTypeKey][mappingTypeKey].push(property);
    }
  }

  /**
   * Adding a style to a mapping collection (or creating a new collection, which ultimately also adds a style),
   * removes it from the list of available styles
   * @param style added style
   */
  handleStyleAdded(style: string): void {
    const index = PropertyService.availableStyleProperties.indexOf(style);
    PropertyService.availableStyleProperties.splice(index, 1);
  }

  /**
   * Removing a style from a mapping collection (or removing a collection),
   * adds it to the list of available styles
   * @param style removed style
   */
  handleStyleRemoved(style: string): void {
    if (!PropertyService.availableStyleProperties.includes(style)) {
      PropertyService.availableStyleProperties.push(style);
    }
  }

}
