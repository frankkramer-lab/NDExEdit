import {EventEmitter, Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import {NeMappingContinuous} from '../models/ne-mapping-continuous';
import {NeMappingDiscrete} from '../models/ne-mapping-discrete';
import {UtilityService} from './utility.service';
import {NeGroupedMappingsDiscrete} from '../models/ne-grouped-mappings-discrete';
import {NeMappingsType} from '../models/ne-mappings-type';
import {NeAspect} from '../models/ne-aspect';
import {NeMappingPassthrough} from "../models/ne-mapping-passthrough";

@Injectable({
  providedIn: 'root'
})

/**
 * Service containing globally accessible data and providing manipulations
 */
export class DataService {

  constructor(
    private utilityService: UtilityService
  ) {
  }

  /**
   * List of networks available to be rendered within the app
   */
  networksParsed: NeNetwork[] = [];
  /**
   * List of networks available in .cx file format
   */
  networksDownloaded: any[] = [];
  /**
   * Selected network of type {@link NeNetwork|NeNetwork}
   */
  selectedNetwork: NeNetwork;
  /**
   * Selected discrete mapping of type {@link NeGroupedMappingsDiscrete}
   */
  selectedDiscreteMapping: NeMappingDiscrete[];
  /**
   * Selected continuous mapping of type {@link NeMappingContinuous}
   */
  selectedContinuousMapping: NeMappingContinuous;
  /**
   * Selected passthrough mapping of type {@link NeMappingPassthrough}
   */
  selectedPassthroughMapping: NeMappingPassthrough;
  /**
   * Selected discrete mapping property
   */
  selectedDiscreteMappingProperty: string;
  /**
   * Name of a property which is to be deleted
   */
  selectedForDeletion: string;
  /**
   * On selection of a mapping this typehint is set
   */
  selectedTypeHint: NeMappingsType;

  /**
   * Canvas used to display a network
   */
  canvas: HTMLElement;
  /**
   * The network ID increment
   */
  currentNetworkId = -1;
  /**
   * List of known color properties, mainly used for color previews within {@link MainMappingsNewComponent}
   */
  colorProperties: string[] = [
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
   * List of known node properties
   */
  nodeProperties = [
    'COMPOUND_NODE_PADDING',
    'COMPOUND_NODE_SHAPE',
    'NODE_BORDER_PAINT',
    'NODE_BORDER_STROKE',
    'NODE_BORDER_TRANSPARENCY',
    'NODE_BORDER_WIDTH',
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
    'NODE_CUSTOMPAINT_9',
    'NODE_DEPTH',
    'NODE_FILL_COLOR',
    'NODE_HEIGHT',
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
    'NODE_Z_LOCATION',
  ];
  /**
   * List of known edge properties
   */
  edgeProperties = [
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
   * Toggle redraw of a chart
   */
  chartRedrawEmitter = new EventEmitter<boolean>();

  /**
   * Toggle flipping the layout
   */
  flipLayoutEmitter = new EventEmitter<boolean>();

  /**
   * Toggle rebuild of the network's core for rendering
   */
  networkChangedEmitter = new EventEmitter<NeNetwork>();

  /**
   * Builds the definition string for a discrete mapping
   * @param mapping Discrete mapping to be condensed into a string
   * @private
   */
  private static buildDiscreteMappingDefinition(mapping: NeMappingDiscrete): string {
    let definition = 'COL=' + mapping.col + ',T=' + mapping.type || 'string';
    for (let i = 0; i < mapping.keys.length; i++) {
      if (mapping.keys[i] !== null && mapping.values[i] !== null) {
        definition += ',K=' + i + '=' + mapping.keys[i];
        definition += ',V=' + i + '=' + mapping.values[i];
      }
    }
    return definition;
  }

  private static buildContinuousMappingDefinition(mapping: NeMappingContinuous, styleProperty: string): string {
    let definition = 'COL=' + mapping.col + ',T=' + mapping.type;

    for (let i = 0; i < mapping.thresholds.length; i++) {
      definition += ',L=' + i + '=' + mapping.equals[i];
      definition += ',E=' + i + '=' + mapping.equals[i];
      definition += ',G=' + i + '=' + mapping.equals[i];
      definition += ',OV=' + i + '=' + mapping.thresholds[i];
    }
    return definition;
  }

  // /**
  //  * After adding a discrete mapping all newly set values have to be aggregated into a nicely displayable mapping
  //  *
  //  * @param discreteMapping Newly created mapping
  //  * @param mappings Existing mappings
  //  * @param isNode True if the mapping applies to nodes, false if the mapping applies to edges
  //  * @private
  //  */
  // private static updateMappings(
  //   discreteMapping: NeMappingsDefinition[],
  //   mappings: NeMappingsMap,
  //   isNode: boolean
  // ): NeGroupedMappingsDiscrete[] {
  //
  //   if (!mappings || discreteMapping.length === 0) {
  //     return [];
  //   }
  //   let groupedMappings: NeGroupedMappingsDiscrete[];
  //   if (isNode) {
  //     groupedMappings = mappings.nodesDiscrete;
  //   } else {
  //     groupedMappings = mappings.edgesDiscrete;
  //   }
  //
  //   const dmCssValues: string[] = [];
  //   const dmSelectors: string[] = [];
  //   for (const dm of discreteMapping) {
  //     dmCssValues.push(dm.cssValue);
  //     dmSelectors.push(dm.selector);
  //   }
  //
  //   const styleMap: NeStyleMap = {
  //     cssKey: discreteMapping[0].cssKey,
  //     cssValues: dmCssValues,
  //     selectors: dmSelectors
  //   };
  //
  //   let found = false;
  //   for (const elementMap of groupedMappings) {
  //     if (discreteMapping[0].colHR === elementMap.classifier) {
  //       found = true;
  //       elementMap.th.push(discreteMapping[0].cssKey);
  //
  //       for (const dm of discreteMapping) {
  //         const writeToIndex = elementMap.selectors.indexOf(dm.selector);
  //         if (writeToIndex === -1) {
  //           // value is not yet in list of values and needs adding => just push to last
  //           elementMap.selectors.push(dm.selector);
  //           elementMap.values.push(dm.isHR);
  //         }
  //       }
  //
  //       if (!elementMap.styleMap.includes(styleMap)) {
  //         elementMap.styleMap.push(styleMap);
  //       }
  //     }
  //   }
  //
  //   if (!found) {
  //     const dmValues: string[] = [];
  //     const dmTh: string[] = [];
  //     for (const dm of discreteMapping) {
  //       if (!dmValues.includes(dm.isHR)) {
  //         dmValues.push(dm.isHR);
  //       }
  //       if (!dmTh.includes(dm.cssKey)) {
  //         dmTh.push(dm.cssKey);
  //       }
  //     }
  //     const newElementMap: NeGroupedMappingsDiscrete = {
  //       classifier: discreteMapping[0].colHR,
  //       values: dmValues,
  //       styleMap: [styleMap],
  //       th: dmTh,
  //       selectors: dmSelectors,
  //     };
  //     groupedMappings.push(newElementMap);
  //   }
  //   return groupedMappings;
  //
  // }

  // /**
  //  * Adds a style object to the graph's existing style
  //  *
  //  * @param existingStyle the graph's current style
  //  * @param styleObj newly created style
  //  * @private
  //  */
  // private static addPropertyToStyle(existingStyle: NeStyle, styleObj: NeStyle): NeStyle {
  //   const keys = Object.keys(styleObj.style);
  //   for (const k of keys) {
  //     existingStyle.style[k] = styleObj.style[k];
  //   }
  //   return existingStyle;
  // }

  /**
   * Selecting a network
   *
   * @param networkId
   */
  public selectNetwork(networkId: number): void {
    this.selectedNetwork = this.networksParsed.find(x => x.id === networkId);
  }

  /**
   * Fetches a network by its id
   * @param id The network's id
   */
  getNetworkById(id: number): NeNetwork {
    return this.networksParsed.find(x => x.id === id);
  }

  /**
   * Removes a mapping completely
   */
  removeMapping(): void {

    let col: string;
    const isDiscrete = this.selectedTypeHint.nd || this.selectedTypeHint.ed;
    const isContinuous = this.selectedTypeHint.nc || this.selectedTypeHint.ec;
    const isNode = this.selectedTypeHint.nd || this.selectedTypeHint.nc || this.selectedTypeHint.np;

    if (isDiscrete) {
      col = this.selectedDiscreteMapping[0].col;
    } else if (isContinuous) {
      col = this.selectedContinuousMapping.col;
    } else {
      col = this.selectedPassthroughMapping.col;
    }

    // todo test this, as soon as multiple adding continuous mapping works again
    if (isNode) {
      for (const nodeAspect of this.selectedNetwork.aspectKeyValuesNodes) {
        if (nodeAspect.name === col) {
          if (isDiscrete) {
            nodeAspect.mapPointerD = [];
          } else if (isContinuous) {
            const mapIndex = this.selectedNetwork.mappings.nodesContinuous.indexOf(this.selectedContinuousMapping);
            nodeAspect.mapPointerC = nodeAspect.mapPointerC.filter(a => a !== 'nc' + mapIndex);
            console.log(nodeAspect);
          } else {
            const mapIndex = this.selectedNetwork.mappings.nodesPassthrough.indexOf(this.selectedPassthroughMapping);
            nodeAspect.mapPointerP = nodeAspect.mapPointerP.filter(a => a !== 'np' + mapIndex);
            console.log(nodeAspect);
          }
        }
      }
    } else {
      for (const edgeAspect of this.selectedNetwork.aspectKeyValuesEdges) {
        if (edgeAspect.name === col) {
          if (isDiscrete) {
            edgeAspect.mapPointerD = [];
          } else if (isContinuous) {
            const mapIndex = this.selectedNetwork.mappings.edgesContinuous.indexOf(this.selectedContinuousMapping);
            edgeAspect.mapPointerC = edgeAspect.mapPointerC.filter(a => a !== 'ec' + mapIndex);
            console.log(edgeAspect);
          } else {
            const mapIndex = this.selectedNetwork.mappings.edgesPassthrough.indexOf(this.selectedPassthroughMapping);
            edgeAspect.mapPointerP = edgeAspect.mapPointerP.filter(a => a !== 'ep' + mapIndex);
            console.log(edgeAspect);
          }
        }
      }
    }

    for (const fd of this.selectedNetwork.cx) {
      if (fd.cyVisualProperties) {
        for (const cvp of fd.cyVisualProperties) {
          if (isNode && cvp.properties_of === 'nodes:default' && cvp.mappings) {

            for (const key of Object.keys(cvp.mappings)) {

              const keyCol = this.utilityService.utilExtractColByMappingString(cvp.mappings[key].definition);
              if (keyCol === col) {
                delete cvp.mappings[key];
              }
            }

          } else if (!isNode && cvp.properties_of === 'edges:default' && cvp.mappings) {
            for (const key of Object.keys(cvp.mappings)) {

              const keyCol = this.utilityService.utilExtractColByMappingString(cvp.mappings[key].definition);
              if (keyCol === col) {
                delete cvp.mappings[key];
              }
            }
          }
        }
      }
    }

    this.triggerNetworkCoreBuild();
    if (isDiscrete) {
      this.selectedDiscreteMapping = null;
      this.selectedDiscreteMappingProperty = null;
    } else if (isContinuous) {
      this.selectedContinuousMapping = null;
    } else {
      this.selectedPassthroughMapping = null;
    }
  }

  /**
   * Returns ID of a discrete mapping, which suits the specified property
   * @param mappings
   * @param property
   */
  findDiscreteMappingForProperty(mappings: NeMappingDiscrete[], property: NeAspect): number {
    for (let i = 0; i < mappings.length; i++) {
      const map = mappings[i];
      if (map.col === property.name) {
        // this.dataService.selectMapping(this.mapType + i); // can only be selected, if mapping was inserted!
        return mappings.indexOf(map);
      }
    }
    return null;
  }

  /**
   * Adds a new mapping to an already parsed network
   */
  addMappingDiscrete(newMapping: NeMappingDiscrete, property: NeAspect, typeHint: NeMappingsType): void {

    if (typeHint.nc || typeHint.ec || typeHint.np || typeHint.ep) {
      console.log('Continuous or passthrough mapping cannot be added as a discrete mapping');
      return;
    }

    const nameOfProperty = newMapping.styleProperty;

    for (const entry of this.selectedNetwork.cx) {
      if (entry.cyVisualProperties) {
        for (const item of entry.cyVisualProperties) {

          if (!item.mappings && item.properties_of !== 'network') {
            item.mappings = {};
            continue;
          }

          if (item.mappings && !item.mappings[nameOfProperty]
            && ((typeHint.nd && (item.properties_of === 'nodes' || item.properties_of === 'nodes:default'))
              || (typeHint.ed && (item.properties_of === 'edges' || item.properties_of === 'edges:default')))
          ) {
            item.mappings[nameOfProperty] = {
              definition: DataService.buildDiscreteMappingDefinition(newMapping),
              type: 'DISCRETE'
            };
          }
        }
      }
    }
    this.triggerNetworkCoreBuild();

  }


  /**
   *
   * @param mapping
   * @param styleProperty
   * @param typeHint
   */
  addMappingContinuous(mapping: NeMappingContinuous, styleProperty: string, typeHint: NeMappingsType): void {
    if (typeHint.nd || typeHint.ed || typeHint.np || typeHint.ep) {
      console.log('Discrete or passthrough mapping cannot be added as a continuous mapping');
      return;
    }

    for (const entry of this.selectedNetwork.cx) {
      if (entry.cyVisualProperties) {
        for (const item of entry.cyVisualProperties) {

          if (!item.mappings && item.properties_of !== 'network') {
            item.mappings = {};
            continue;
          }

          if (item.mappings && !item.mappings[styleProperty]
            && ((typeHint.nc && (item.properties_of === 'nodes' || item.properties_of === 'nodes:default'))
              || (typeHint.ec && (item.properties_of === 'edges' || item.properties_of === 'edges:default')))
          ) {
            item.mappings[styleProperty] = {
              definition: DataService.buildContinuousMappingDefinition(mapping, styleProperty),
              type: 'CONTINUOUS'
            };
          }
        }
      }
    }
    this.triggerNetworkCoreBuild();

  }

  /**
   * Removing a property from an existing mapping can only be executed for discrete mappings.
   * It works directly on the cx data and triggers the core rebuild.
   */
  removePropertyFromMapping(): void {
    const isNode = this.selectedTypeHint.nd;

    for (const fd of this.selectedNetwork.cx) {
      if (fd.cyVisualProperties) {
        for (const cvp of fd.cyVisualProperties) {
          if (isNode && cvp.properties_of === 'nodes:default' && cvp.mappings) {
            if (cvp.mappings[this.selectedForDeletion]) {
              delete cvp.mappings[this.selectedForDeletion];
              break;
            }

          } else if (!isNode && cvp.properties_of === 'edges:default' && cvp.mappings) {
            if (cvp.mappings[this.selectedForDeletion]) {
              delete cvp.mappings[this.selectedForDeletion];
              break;
            }
          }
        }
      }
    }

    this.triggerNetworkCoreBuild();

  }

  /**
   * Edits an existing mapping, usable for both discrete and contiuous mappings
   *
   * @param id network's id
   * @param mappingToEdit updated mapping
   * @param styleProperty corresponding style from within the network's existing style
   * @param mappingsType true for type of mapping
   */
  // editMapping(
  //   id: number,
  //   mappingToEdit: any | any[],
  //   styleProperty: string,
  //   mappingsType: NeMappingsType
  // ): void {
  //   const network = this.getNetworkById(id);
  //   if (mappingsType.nd) {
  //
  //     const existingNdMappingIndex = network.mappings.nodesDiscrete.findIndex(x => x.classifier === mappingToEdit[0].colHR
  //       && x.styleMap.map(a => a.cssKey).includes(mappingToEdit[0].cssKey));
  //     const existingNdMapping = network.mappings.nodesDiscrete[existingNdMappingIndex];
  //     const correspondingStyleMapNd = existingNdMapping.styleMap.find(x => x.cssKey === mappingToEdit[0].cssKey);
  //     const ndMappingsNotFound = [];
  //     const ndStyles: NeStyle[] = network.style;
  //
  //     for (const map of mappingToEdit) {
  //       const currentSelector = map.selector;
  //       let found = false;
  //       for (let i = 0; i < correspondingStyleMapNd.cssValues.length; i++) {
  //         if (correspondingStyleMapNd.selectors[i] === currentSelector) {
  //           correspondingStyleMapNd.cssValues[i] = map.cssValue;
  //           found = true;
  //         }
  //       }
  //       if (!found) {
  //         ndMappingsNotFound.push(map);
  //         correspondingStyleMapNd.cssValues.push(map.cssValue);
  //         correspondingStyleMapNd.selectors.push(currentSelector);
  //       }
  //     }
  //     for (let i = 0; i < correspondingStyleMapNd.selectors.length; i++) {
  //       let found = false;
  //       for (const s of network.style) {
  //         if (s.selector === correspondingStyleMapNd.selectors[i]) {
  //           found = true;
  //           s.style[correspondingStyleMapNd.cssKey] = correspondingStyleMapNd.cssValues[i];
  //         }
  //       }
  //       if (!found) {
  //         const newStyle: NeStyle = {
  //           selector: correspondingStyleMapNd.selectors[i],
  //           style: {},
  //           appliedTo: [],
  //           priority: UtilityService.utilFindPriorityBySelector(correspondingStyleMapNd.selectors[i]),
  //         };
  //         newStyle.style[correspondingStyleMapNd.cssKey] = correspondingStyleMapNd.cssValues[i];
  //
  //         for (const map of ndMappingsNotFound) {
  //           for (const element of network.elements) {
  //             if (element.group === 'nodes') {
  //               for (const attribute of element.data.attributes) {
  //                 if (attribute.keyHR === map.colHR && attribute.valueHR === map.isHR) {
  //                   element.data.classes.push(map.selector.substring(1));
  //                   element.classes = element.data.classes.join(' ');
  //                   newStyle.appliedTo.push(element.data as NeNode);
  //                 }
  //               }
  //             }
  //             for (const nodeMap of network.mappings.nodesDiscrete) {
  //               if (nodeMap.classifier === map.colHR) {
  //                 if (!nodeMap.selectors.includes(map.selector)) {
  //                   nodeMap.selectors.push(map.selector);
  //                 }
  //                 if (!nodeMap.values.includes(map.isHR)) {
  //                   nodeMap.values.push(map.isHR);
  //                 }
  //               }
  //             }
  //           }
  //         }
  //         network.style = UtilityService.utilOrderStylesByPriority(ndStyles.concat([newStyle]));
  //       }
  //     }
  //
  //   } else if (mappingsType.ed) {
  //
  //     const existingEdMappingIndex = network.mappings.edgesDiscrete.findIndex(x => x.classifier === mappingToEdit[0].colHR
  //       && x.styleMap.map(a => a.cssKey).includes(mappingToEdit[0].cssKey));
  //     const existingEdMapping = network.mappings.edgesDiscrete[existingEdMappingIndex];
  //     const correspondingStyleMapEd = existingEdMapping.styleMap.find(x => x.cssKey === mappingToEdit[0].cssKey);
  //     const edMappingsNotFound = [];
  //     const edStyles: NeStyle[] = network.style;
  //
  //     for (const map of mappingToEdit) {
  //       let found = false;
  //       const currentSelector = map.selector;
  //       for (let i = 0; i < correspondingStyleMapEd.cssValues.length; i++) {
  //         if (correspondingStyleMapEd.selectors[i] === currentSelector) {
  //           correspondingStyleMapEd.cssValues[i] = map.cssValue;
  //           found = true;
  //         }
  //       }
  //       if (!found) {
  //         edMappingsNotFound.push(map);
  //         correspondingStyleMapEd.cssValues.push(map.cssValue);
  //         correspondingStyleMapEd.selectors.push(currentSelector);
  //       }
  //     }
  //
  //     for (let i = 0; i < correspondingStyleMapEd.selectors.length; i++) {
  //       let found = false;
  //       for (const s of network.style) {
  //         if (s.selector === correspondingStyleMapEd.selectors[i]) {
  //           found = true;
  //           s.style[correspondingStyleMapEd.cssKey] = correspondingStyleMapEd.cssValues[i];
  //         }
  //       }
  //       if (!found) {
  //         const newStyle: NeStyle = {
  //           selector: correspondingStyleMapEd.selectors[i],
  //           style: {},
  //           appliedTo: [],
  //           priority: UtilityService.utilFindPriorityBySelector(correspondingStyleMapEd.selectors[i]),
  //         };
  //         newStyle.style[correspondingStyleMapEd.cssKey] = correspondingStyleMapEd.cssValues[i];
  //
  //         for (const map of edMappingsNotFound) {
  //           for (const element of network.elements) {
  //             if (element.group === 'edges') {
  //               for (const attribute of element.data.attributes) {
  //                 if (attribute.keyHR === map.colHR && attribute.valueHR === map.isHR) {
  //                   element.data.classes.push(map.selector.substring(1));
  //                   element.classes = element.data.classes.join(' ');
  //                   newStyle.appliedTo.push(element.data as NeEdge);
  //                 }
  //               }
  //             }
  //             for (const edgeMap of network.mappings.edgesDiscrete) {
  //               if (edgeMap.classifier === map.colHR) {
  //                 if (!edgeMap.selectors.includes(map.selector)) {
  //                   edgeMap.selectors.push(map.selector);
  //                 }
  //                 if (!edgeMap.values.includes(map.isHR)) {
  //                   edgeMap.values.push(map.isHR);
  //                 }
  //               }
  //             }
  //           }
  //         }
  //         network.style = UtilityService.utilOrderStylesByPriority(edStyles.concat([newStyle]));
  //
  //       }
  //     }
  //
  //   } else if (mappingsType.nc) {
  //     // all selectors are there, but thresholds need to be re-calculated
  //     mappingToEdit.breakpoints = mappingToEdit.breakpoints.filter(x => x.value !== null);
  //     mappingToEdit.breakpoints = mappingToEdit.breakpoints.sort((a, b) => a.value > b.value ? 1 : -1);
  //
  //
  //     const existingNcMappingIndex = network.mappings.nodesContinuous.findIndex(x => x.title[0] === mappingToEdit.cssKey
  //       && x.title[1] === mappingToEdit.mappedProperty.name);
  //     const existingNcMapping = network.mappings.nodesContinuous[existingNcMappingIndex];
  //     const ncAkv = network.aspectKeyValuesNodes.find(x => x.name === existingNcMapping.title[1]);
  //
  //     if (existingNcMapping.chartValid) {
  //
  //       existingNcMapping.chart.chartData[0].data[0] = mappingToEdit.defaultLower;
  //       existingNcMapping.chart.chartData[0].data[mappingToEdit.breakpoints.length + 1] = mappingToEdit.defaultGreater;
  //
  //       for (let i = 0; i < mappingToEdit.breakpoints.length; i++) {
  //         existingNcMapping.chart.chartData[0].data[1 + i] = mappingToEdit.breakpoints[i].propertyValue;
  //         existingNcMapping.chart.chartLabels[1 + i] = mappingToEdit.breakpoints[i].value;
  //       }
  //
  //     } else if (existingNcMapping.gradientValid) {
  //
  //       const min = ncAkv.min;
  //       const max = ncAkv.max;
  //       const range = max - min;
  //
  //       const newNcMapping = existingNcMapping;
  //       const title = existingNcMapping.colorGradient[0].title;
  //       newNcMapping.colorGradient = [];
  //
  //       for (const breakpoint of mappingToEdit.breakpoints) {
  //         newNcMapping.colorGradient.push({
  //           color: breakpoint.propertyValue,
  //           numericThreshold: breakpoint.value,
  //           offset: String((Number(breakpoint.value) - min) * 100 / range) + '%',
  //           title,
  //         });
  //       }
  //
  //       newNcMapping.colorGradient = [{
  //         color: mappingToEdit.defaultLower,
  //         numericThreshold: String(Number.MIN_SAFE_INTEGER),
  //         offset: '-1',
  //         title
  //       }].concat(newNcMapping.colorGradient);
  //
  //       newNcMapping.colorGradient.push({
  //         color: mappingToEdit.defaultGreater,
  //         numericThreshold: String(Number.MAX_SAFE_INTEGER),
  //         offset: '101',
  //         title
  //       });
  //
  //     }
  //     network.elements = this.updateElementsContinuously(true,
  //       mappingToEdit, network, Number(mappingToEdit.mappedProperty.min), Number(mappingToEdit.mappedProperty.max));
  //
  //   } else if (mappingsType.ec) {
  //     mappingToEdit.breakpoints = mappingToEdit.breakpoints.filter(x => x.value !== null);
  //     mappingToEdit.breakpoints = mappingToEdit.breakpoints.sort((a, b) => a.value > b.value ? 1 : -1);
  //
  //     const existingEcMappingIndex = network.mappings.edgesContinuous.findIndex(x => x.title[0] === mappingToEdit.cssKey
  //       && x.title[1] === mappingToEdit.mappedProperty.name);
  //     const existingEcMapping = network.mappings.edgesContinuous[existingEcMappingIndex];
  //     const ecAkv = network.aspectKeyValuesEdges.find(x => x.name === existingEcMapping.title[1]);
  //
  //     if (existingEcMapping.chartValid) {
  //       // update chart
  //       existingEcMapping.chart.chartData[0].data[0] = mappingToEdit.defaultLower;
  //       existingEcMapping.chart.chartData[0].data[mappingToEdit.breakpoints.length + 1] = mappingToEdit.defaultGreater;
  //
  //       for (let i = 0; i < mappingToEdit.breakpoints.length; i++) {
  //         existingEcMapping.chart.chartData[0].data[1 + i] = mappingToEdit.breakpoints[i].propertyValue;
  //         existingEcMapping.chart.chartLabels[1 + i] = mappingToEdit.breakpoints[i].value;
  //       }
  //       existingEcMapping.chart.chartLabels.push('');
  //     } else if (existingEcMapping.gradientValid) {
  //
  //       const min = ecAkv.min;
  //       const max = ecAkv.max;
  //       const range = max - min;
  //
  //       const newEcMapping = existingEcMapping;
  //       const title = existingEcMapping.colorGradient[0].title;
  //       newEcMapping.colorGradient = [];
  //
  //       for (const breakpoint of mappingToEdit.breakpoints) {
  //         newEcMapping.colorGradient.push({
  //           color: breakpoint.propertyValue,
  //           numericThreshold: breakpoint.value,
  //           offset: String((Number(breakpoint.value) - min) * 100 / range) + '%',
  //           title,
  //         });
  //       }
  //
  //       newEcMapping.colorGradient = [{
  //         color: mappingToEdit.defaultLower,
  //         numericThreshold: String(Number.MIN_SAFE_INTEGER),
  //         offset: '-1',
  //         title
  //       }].concat(newEcMapping.colorGradient);
  //
  //       newEcMapping.colorGradient.push({
  //         color: mappingToEdit.defaultGreater,
  //         numericThreshold: String(Number.MAX_SAFE_INTEGER),
  //         offset: '101',
  //         title
  //       });
  //
  //     }
  //     network.elements = this.updateElementsContinuously(false,
  //       mappingToEdit, network, Number(mappingToEdit.mappedProperty.min), Number(mappingToEdit.mappedProperty.max));
  //
  //   }
  // }

  /**
   * Updates all elements after adding a new continuous mapping or after editing an existing continuous mapping
   *
   * @param isNode true if elements are nodes
   * @param continuousMapping new or existing continuous mapping
   * @param network corresponding network
   * @param minPropertyValue minimum of the element's attribute's values
   * @param maxPropertyValue maximum of the elements's attribute's values
   * @private
   */
  // private updateElementsContinuously(
  //   isNode: boolean,
  //   continuousMapping: any,
  //   network: NeNetwork,
  //   minPropertyValue,
  //   maxPropertyValue
  // ): ElementDefinition[] {
  //
  //   const styles: NeStyle[] = network.style;
  //   const styleComponentList: NeStyleComponent[] = [];
  //   const elements: ElementDefinition[] = network.elements;
  //
  //   for (const element of elements) {
  //     if (isNode ? element.group === 'nodes' : element.group === 'edges') {
  //       for (const attribute of element.data.attributes) {
  //         if (attribute.keyHR === continuousMapping.mappedProperty.name) {
  //           const elementValue = Number(attribute.valueHR);
  //
  //           let index = 0;
  //           while (continuousMapping.breakpoints.length > index && continuousMapping.breakpoints[index].value < elementValue) {
  //             index++;
  //           }
  //
  //           const selector = ((isNode) ? '.node_' : '.edge_') + element.data.id;
  //           const style = styles.find(x => x.selector === selector);
  //
  //           const tmpData = (isNode ? [element.data as NeNode] : [element.data as NeEdge]);
  //
  //           const styleComponent: NeStyleComponent = {
  //             selector,
  //             cssKey: '',
  //             cssValue: '',
  //             priority: 2
  //           };
  //
  //           const styleObj: NeStyle = {
  //             selector,
  //             style: {},
  //             appliedTo: tmpData,
  //             priority: 2
  //           };
  //
  //           if (!element.data.classes.includes(selector.substring(1))) {
  //             element.data.classes.push(selector.substring(1));
  //             element.classes = element.data.classes.join(' ');
  //           }
  //
  //           if (continuousMapping.breakpoints[index] && continuousMapping.breakpoints[index].value === elementValue) {
  //             // case 1: element hits breakpoint threshold => apply threshold value
  //             styleObj.style[continuousMapping.cssKey] = continuousMapping.breakpoints[index].propertyValue;
  //             styleComponent.cssKey = continuousMapping.cssKey;
  //             styleComponent.cssValue = continuousMapping.breakpoints[index].propertyValue;
  //
  //           } else if (index === 0 && continuousMapping.breakpoints[index] && continuousMapping.breakpoints[index].value > elementValue) {
  //             // case 2: element is smaller than lowest threshold => apply relatively lower
  //             const inputMap: NeContinuousMap = {
  //               inputValue: String(elementValue),
  //               lowerThreshold: String(minPropertyValue),
  //               lower: continuousMapping.defaultLower,
  //               greaterThreshold: String(continuousMapping.breakpoints[index].value),
  //               greater: String(continuousMapping.breakpoints[index].propertyValue)
  //             };
  //
  //             const relativeValue = UtilityService.utilCalculateRelativeValue(inputMap);
  //             styleObj.style[continuousMapping.cssKey] = relativeValue;
  //             styleComponent.cssKey = continuousMapping.cssKey;
  //             styleComponent.cssValue = relativeValue;
  //
  //           } else if (continuousMapping.breakpoints[index] && continuousMapping.breakpoints[index].value > elementValue) {
  //             // case 3: element lower than the current breakpoint =>
  //             // calculate relative value between two breakpoints or lowest default and current breakpoint
  //
  //             let limitLow: NeThresholdMap;
  //             if (index === 0) {
  //               limitLow = {
  //                 value: minPropertyValue,
  //                 propertyValue: continuousMapping.defaultLower,
  //                 isEditable: true
  //               };
  //             } else {
  //               limitLow = continuousMapping.breakpoints[index - 1];
  //             }
  //
  //             const limitHigh = continuousMapping.breakpoints[index];
  //             const inputMap: NeContinuousMap = {
  //               inputValue: String(elementValue),
  //               lowerThreshold: String(limitLow.value),
  //               lower: String(limitLow.propertyValue),
  //               greaterThreshold: String(limitHigh.value),
  //               greater: String(limitHigh.propertyValue)
  //             };
  //
  //             const relativeValue = UtilityService.utilCalculateRelativeValue(inputMap);
  //             styleObj.style[continuousMapping.cssKey] = relativeValue;
  //             styleComponent.cssKey = continuousMapping.cssKey;
  //             styleComponent.cssValue = relativeValue;
  //
  //           } else if (index === continuousMapping.breakpoints.length && index > 0
  //             && elementValue > continuousMapping.breakpoints[index - 1].value) {
  //             // case 4: maxxed out index and elements value still greater => apply relatively greater
  //
  //             const inputMap: NeContinuousMap = {
  //               inputValue: String(elementValue),
  //               lowerThreshold: String(continuousMapping.breakpoints[index - 1].value),
  //               lower: String(continuousMapping.breakpoints[index - 1].propertyValue),
  //               greaterThreshold: String(maxPropertyValue),
  //               greater: String(continuousMapping.defaultGreater)
  //             };
  //
  //             const relativeValue = UtilityService.utilCalculateRelativeValue(inputMap);
  //             styleObj.style[continuousMapping.cssKey] = relativeValue;
  //             styleComponent.cssKey = continuousMapping.cssKey;
  //             styleComponent.cssValue = relativeValue;
  //
  //           } else if (index === 0 && index === continuousMapping.breakpoints.length) {
  //             const inputMap: NeContinuousMap = {
  //               inputValue: String(elementValue),
  //               lowerThreshold: String(minPropertyValue),
  //               lower: String(continuousMapping.defaultLower),
  //               greaterThreshold: String(maxPropertyValue),
  //               greater: String(continuousMapping.defaultGreater)
  //             };
  //
  //             const relativeValue = UtilityService.utilCalculateRelativeValue(inputMap);
  //             styleObj.style[continuousMapping.cssKey] = relativeValue;
  //             styleComponent.cssKey = continuousMapping.cssKey;
  //             styleComponent.cssValue = relativeValue;
  //
  //           }
  //
  //           styleComponentList.push(styleComponent);
  //
  //           if (!style) {
  //             styles.push(styleObj);
  //           } else {
  //             network.style = styles.filter(x => x !== style).concat(DataService.addPropertyToStyle(style, styleObj));
  //             network.style = UtilityService.utilOrderStylesByPriority(network.style);
  //           }
  //         }
  //       }
  //     }
  //   }
  //
  //   if (isNode) {
  //     network.mappings.nodesContinuous[network.mappings.nodesContinuous.length - 1].values = styleComponentList;
  //   } else {
  //     network.mappings.edgesContinuous[network.mappings.edgesContinuous.length - 1].values = styleComponentList;
  //   }
  //
  //   return elements;
  // }

  /**
   * Emits a value to trigger redrawing of a displayed chart
   * Avoids unpretty distortions of charts
   */
  triggerChartRedraw(): void {
    this.chartRedrawEmitter.emit(true);
  }

  /**
   * Incrementing the network ID increment and returning it.
   */
  nextId(): number {
    return ++this.currentNetworkId;
  }

  /**
   * Returns a mapping based on its ID and the currently selected network
   * @param index string literal, e.g. 'nd0' for nodes discrete at index 0 of the current network
   */
  findMappingById(index: string): NeMappingContinuous | NeMappingDiscrete {
    const typeHint = this.utilityService.utilGetTypeHintByString(index.substr(0, 2));
    const i = index.substr(2);

    if (typeHint.nd) {
      return this.selectedNetwork.mappings.nodesDiscrete[i];
    } else if (typeHint.ed) {
      return this.selectedNetwork.mappings.edgesDiscrete[i];
    } else if (typeHint.nc) {
      return this.selectedNetwork.mappings.nodesContinuous[i];
    } else if (typeHint.ec) {
      return this.selectedNetwork.mappings.edgesContinuous[i];
    } else {
      console.log('no matching mapping found');
      return null;
    }
  }

  /**
   * Selects a discrete or continuous mapping based on a typehint
   * @param mapHint [DISCRETE] hint containing typehint
   * @param col [DISCRETE] property needs to be specified when selecting a discrete mapping
   * @param mapId [CONTINUOUS] string containing both typehint and id for continuous mappings
   */
  selectMapping(mapHint: string = null, col: string = null, mapId: string = null): void {

    if (mapId !== null) {
      // continuous or passthrough mapping do not need property
      this.selectedTypeHint = this.utilityService.utilGetTypeHintByString(mapId.substr(0, 2));
      const pointer = Number(mapId.substr(2));

      if (this.selectedTypeHint.nc) {
        this.selectedContinuousMapping = this.selectedNetwork.mappings.nodesContinuous[pointer];
        this.selectedPassthroughMapping = null;
      } else if (this.selectedTypeHint.ec) {
        this.selectedContinuousMapping = this.selectedNetwork.mappings.edgesContinuous[pointer];
        this.selectedPassthroughMapping = null;
      } else if (this.selectedTypeHint.np) {
        this.selectedPassthroughMapping = this.selectedNetwork.mappings.nodesPassthrough[pointer];
        this.selectedContinuousMapping = null;
      } else if (this.selectedTypeHint.ep) {
        this.selectedPassthroughMapping = this.selectedNetwork.mappings.edgesPassthrough[pointer];
        this.selectedContinuousMapping = null;
      }

      this.selectedDiscreteMapping = null;
      this.selectedDiscreteMappingProperty = null;
      console.log(this.selectedContinuousMapping, this.selectedPassthroughMapping);

    } else {

      this.selectedTypeHint = this.utilityService.utilGetTypeHintByString(mapHint);
      const selectedDiscrete: NeMappingDiscrete[] = [];

      if (this.selectedTypeHint.nd) {
        for (const nd of this.selectedNetwork.mappings.nodesDiscrete) {
          if (nd.col === col && !selectedDiscrete.includes(nd)) {
            if (this.selectedDiscreteMappingProperty !== nd.col) {
              this.selectedDiscreteMappingProperty = nd.col;
            }
            selectedDiscrete.push(nd);
          }
        }
      } else if (this.selectedTypeHint.ed) {
        for (const ed of this.selectedNetwork.mappings.edgesDiscrete) {
          if (ed.col === col && !selectedDiscrete.includes(ed)) {
            if (this.selectedDiscreteMappingProperty !== ed.col) {
              this.selectedDiscreteMappingProperty = ed.col;
            }
            selectedDiscrete.push(ed);
          }
        }
      }
      this.selectedDiscreteMapping = selectedDiscrete;
      this.selectedContinuousMapping = null;
      this.selectedPassthroughMapping = null;
    }
  }

  /**
   * Selects a property within a discrete mapping for deletion.
   * A discrete mapping has to be active for this to work
   * @param propertyId points to the id within the discrete mapping to be deleted
   */
  selectPropertyForDeletion(propertyId: number = null): void {
    if (propertyId === null) {
      this.selectedForDeletion = null;
      return;
    }

    if (!this.selectedDiscreteMapping) {
      console.log('No discrete mapping selected to delete property with ID: ' + propertyId);
      return;
    }
    this.selectedForDeletion = this.selectedDiscreteMapping[propertyId].styleProperty;
  }

  /**
   * Resets a selected discrete mapping property
   */
  resetDiscreteMappingPropertySelection(): void {
    this.selectedDiscreteMappingProperty = null;
  }

  /**
   * Resets continuous and discrete mapping selection
   */
  resetAnyMappingSelection(): void {
    this.selectedDiscreteMapping = null;
    this.selectedContinuousMapping = null;
    this.selectedTypeHint = null;
  }

  /**
   * Emits the currently changed network
   * @private
   */
  private triggerNetworkCoreBuild(): void {
    this.networkChangedEmitter.emit(this.selectedNetwork);
  }

  /**
   * Defines the canvas to be used to render a network
   * @param nativeElement HTML element used as canvas
   */
  setCanvas(nativeElement: any): void {
    if (nativeElement) {
      this.canvas = nativeElement;
    }
  }

  /**
   * Returns the mapping belonging to this typehint with id, e.g. 'nd0' returns the discrete node mapping on index 0
   * @param hintWithId string containing both typehint and id
   */
  getMappingByHintAndId(hintWithId: string): NeMappingDiscrete | NeMappingContinuous {
    const hintString = hintWithId.substring(0, 2);
    const id = hintWithId.substring(2);
    const typeHint = this.utilityService.utilGetTypeHintByString(hintString);
    if (typeHint.nd) {
      return this.selectedNetwork.mappings.nodesDiscrete[id];
    } else if (typeHint.nc) {
      return this.selectedNetwork.mappings.nodesContinuous[id];
    } else if (typeHint.ed) {
      return this.selectedNetwork.mappings.edgesDiscrete[id];
    } else if (typeHint.ec) {
      return this.selectedNetwork.mappings.edgesContinuous[id];
    } else if (typeHint.np) {
      return this.selectedNetwork.mappings.nodesPassthrough[id];
    } else if (typeHint.ep) {
      return this.selectedNetwork.mappings.edgesPassthrough[id];
    }
  }
}
