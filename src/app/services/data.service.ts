import {EventEmitter, Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import {NeMappingContinuous} from '../models/ne-mapping-continuous';
import {NeMappingDiscrete} from '../models/ne-mapping-discrete';
import {UtilityService} from './utility.service';
import {NeGroupedMappingsDiscrete} from "../models/ne-grouped-mappings-discrete";
import {NeStyleMap} from "../models/ne-style-map";
import {NeMappingsType} from "../models/ne-mappings-type";

@Injectable({
  providedIn: 'root'
})

/**
 * Service containing globally accessible data and providing manipulations
 */
export class DataService {

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
  selectedDiscreteMapping: NeGroupedMappingsDiscrete;
  /**
   * Selected continuous mapping of type {@link NeMappingContinuous}
   */
  selectedContinuousMapping: NeMappingContinuous;
  /**
   * Selected discrete mapping property of type {@link NeStyleMap}
   */
  selectedDiscreteMappingProperty: NeStyleMap;
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

  constructor(
    private utilityService: UtilityService
  ) {
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

  // /**
  //  * Removes a mapping completely
  //  * @param map The specified discrete mappping
  //  */
  // removeMapping(map: any): void {
  //
  //   const network = this.getNetworkById(map.network);
  //
  //   switch (map.type) {
  //     case 'nd':
  //       const ndSelectors = network.mappings.nodesDiscrete[map.mappingId].selectors;
  //       network.mappings.nodesDiscrete.splice(map.mappingId, 1);
  //       const ndNewStyle = network.style.filter(x => !ndSelectors.includes(x.selector));
  //
  //       for (const selector of ndSelectors) {
  //         const className = selector.substring(1);
  //         for (const element of network.elements) {
  //
  //           if (element.classes.includes(className)) {
  //             element.data.classes = element.data.classes.filter(x => x !== className);
  //             element.classes = element.classes.replace(className, '').trim();
  //           }
  //         }
  //       }
  //
  //       network.style = ndNewStyle;
  //       network.aspectKeyValuesNodes[map.akvIndex].mapPointerD = network
  //         .aspectKeyValuesNodes[map.akvIndex]
  //         .mapPointerD
  //         .filter(x => x !== map.mappingId);
  //
  //       for (const akv of network.aspectKeyValuesNodes) {
  //         akv.mapPointerD = akv.mapPointerD.map(x => x > map.mappingId ? --x : x);
  //       }
  //       break;
  //
  //     case 'nc':
  //       const nodeAkvs = network.aspectKeyValuesNodes;
  //       const nodeElements = network.elements;
  //       const nodeStyle = network.style;
  //       let updatedNodeStyle = nodeStyle;
  //
  //       for (const s of nodeStyle) {
  //         for (const node of nodeElements) {
  //
  //           if (node.group === 'nodes') {
  //             const currentSelector = '.node_' + node.data.id;
  //
  //             if (s.selector === currentSelector) {
  //               delete s.style[map.map.title[0]];
  //
  //               if (Object.keys(s.style).length === 0) {
  //                 updatedNodeStyle = updatedNodeStyle.filter(x => x !== s);
  //               }
  //             }
  //           }
  //         }
  //       }
  //
  //       if (nodeAkvs[map.akvIndex].mapPointerC.includes(map.mappingId)) {
  //         nodeAkvs[map.akvIndex].mapPointerC = nodeAkvs[map.akvIndex].mapPointerC.filter(x => x !== map.mappingId);
  //       }
  //
  //       network.style = updatedNodeStyle;
  //       network.elements = nodeElements;
  //       network.aspectKeyValuesNodes = nodeAkvs;
  //       network.mappings.nodesContinuous
  //         = network.mappings.nodesContinuous.filter(x => network.mappings.nodesContinuous.indexOf(x) !== map.mappingId);
  //
  //       for (const akv of network.aspectKeyValuesNodes) {
  //         akv.mapPointerC = akv.mapPointerC.map(x => x > map.mappingId ? --x : x);
  //       }
  //
  //       this.networksParsed = this.networksParsed.filter(x => x.id !== map.network).concat(network);
  //       break;
  //
  //     case 'ed':
  //
  //       const edSelectors = network.mappings.edgesDiscrete[map.mappingId].selectors;
  //       network.mappings.edgesDiscrete.splice(map.mappingId, 1);
  //       const edNewStyle = network.style.filter(x => !edSelectors.includes(x.selector));
  //
  //       for (const selector of edSelectors) {
  //         const className = selector.substring(1);
  //         for (const element of network.elements) {
  //
  //           if (element.classes.includes(className)) {
  //             element.classes = element.classes.replace(className, '').trim();
  //           }
  //         }
  //       }
  //
  //       network.style = edNewStyle;
  //       network.aspectKeyValuesEdges[map.akvIndex].mapPointerD = network
  //         .aspectKeyValuesEdges[map.akvIndex]
  //         .mapPointerD
  //         .filter(x => x !== map.mappingId);
  //
  //       for (const akv of network.aspectKeyValuesEdges) {
  //         akv.mapPointerD = akv.mapPointerD.map(x => x > map.mappingId ? --x : x);
  //       }
  //       break;
  //
  //     case 'ec':
  //
  //       const edgeAkvs = network.aspectKeyValuesEdges;
  //       const edgeElements = network.elements;
  //       const edgeStyle = network.style;
  //       let updatedEdgeStyle = edgeStyle;
  //
  //       for (const s of edgeStyle) {
  //         for (const edge of edgeElements) {
  //
  //           if (edge.group === 'edges') {
  //             const currentSelector = '.edge_' + edge.data.id;
  //
  //             if (s.selector === currentSelector) {
  //               delete s.style[map.map.title[0]];
  //
  //               if (Object.keys(s.style).length === 0) {
  //                 updatedEdgeStyle = updatedEdgeStyle.filter(x => x !== s);
  //               }
  //             }
  //           }
  //         }
  //       }
  //
  //       if (edgeAkvs[map.akvIndex].mapPointerC.includes(map.mappingId)) {
  //         edgeAkvs[map.akvIndex].mapPointerC = edgeAkvs[map.akvIndex].mapPointerC.filter(x => x !== map.mappingId);
  //       }
  //
  //       network.style = updatedEdgeStyle;
  //       network.elements = edgeElements;
  //       network.aspectKeyValuesEdges = edgeAkvs;
  //       network.mappings.edgesContinuous
  //         = network.mappings.edgesContinuous.filter(x => network.mappings.edgesContinuous.indexOf(x) !== map.mappingId);
  //
  //       for (const akv of network.aspectKeyValuesEdges) {
  //         akv.mapPointerC = akv.mapPointerC.map(x => x > map.mappingId ? --x : x);
  //       }
  //
  //       this.networksParsed = this.networksParsed.filter(x => x.id !== map.network).concat(network);
  //       break;
  //   }
  // }

  // /**
  //  * Adds a new mapping to an already parsed network
  //  * @param id The network's id
  //  * @param isNode Indicates if the type to which the mapping belongs is a {@link NeNode|node}
  //  * @param discreteMapping The specified mapping which is filled in {@link MainMappingsNewComponent}
  //  */
  // addMappingDiscrete(id: number, isNode: boolean, discreteMapping: NeMappingsDefinition[]): void {
  //   const network = this.getNetworkById(id);
  //   const styles: NeStyle[] = network.style;
  //   const elements = network.elements;
  //
  //   for (const map of discreteMapping) {
  //
  //     if (map.cssValue !== '') {
  //
  //       const styleProperty = {};
  //       styleProperty[map.cssKey] = map.cssValue;
  //       const styleMap: NeStyle = {
  //         selector: map.selector,
  //         style: styleProperty,
  //         appliedTo: [],
  //         priority: map.priority
  //       };
  //
  //       for (const element of elements) {
  //         for (const attribute of element.data.attributes) {
  //           if (attribute.key === map.col && attribute.value === map.is && !element.data.classes.includes(map.selector.substring(1))) {
  //             element.data.classes.push(map.selector.substring(1));
  //             element.classes = element.data.classes.join(' ');
  //             if (isNode && !styleMap.appliedTo.includes(element.data as NeNode)) {
  //               styleMap.appliedTo.push(element.data as NeNode);
  //               break;
  //             } else if (!styleMap.appliedTo.includes(element.data as NeEdge)) {
  //               styleMap.appliedTo.push(element.data as NeEdge);
  //               break;
  //             }
  //           } else if (attribute.key === map.col) {
  //             const tmpSelector = (isNode ? 'node_' : 'edge_') + attribute.key + '_' + attribute.value;
  //             if (!element.data.classes.includes(tmpSelector)) {
  //               element.data.classes.push(tmpSelector);
  //               element.classes = element.data.classes.join(' ');
  //             }
  //           }
  //         }
  //       }
  //       if (!styles.includes(styleMap)) {
  //         let found = false;
  //         for (const s of styles) {
  //           if (s.selector === styleMap.selector) {
  //             found = true;
  //             s.style[map.cssKey] = map.cssValue;
  //           }
  //         }
  //         if (!found) {
  //           styles.push(styleMap);
  //         }
  //       }
  //     }
  //   }
  //
  //   network.style = UtilityService.utilOrderStylesByPriority(styles);
  //   network.elements = elements;
  //
  //   if (isNode) {
  //     // check if we need to update mappointers
  //     let changeMapPointerNodes = true;
  //     for (const nodeMap of network.mappings.nodesDiscrete) {
  //       if (nodeMap.classifier === discreteMapping[0].colHR) {
  //         changeMapPointerNodes = false;
  //         break;
  //       }
  //     }
  //
  //     if (changeMapPointerNodes) {
  //       for (const akv of network.aspectKeyValuesNodes) {
  //         if (akv.name === discreteMapping[0].colHR
  //           && !akv.mapPointerD.includes(network.mappings.nodesDiscrete.length)) {
  //           akv.mapPointerD.push(network.mappings.nodesDiscrete.length);
  //         }
  //       }
  //     }
  //
  //
  //   } else {
  //     let changeMapPointerEdges = true;
  //
  //     for (const edgeMap of network.mappings.edgesDiscrete) {
  //       if (edgeMap.classifier === discreteMapping[0].colHR) {
  //         changeMapPointerEdges = false;
  //         break;
  //       }
  //     }
  //
  //     if (changeMapPointerEdges) {
  //       for (const akv of network.aspectKeyValuesEdges) {
  //         if (akv.name === discreteMapping[0].colHR && !akv.mapPointerD.includes(network.mappings.edgesDiscrete.length)) {
  //           akv.mapPointerD.push(network.mappings.edgesDiscrete.length);
  //         }
  //       }
  //     }
  //
  //   }
  //
  //   const newlyGroupedMappings = DataService.updateMappings(discreteMapping, network.mappings, isNode);
  //   if (isNode) {
  //     network.mappings.nodesDiscrete = newlyGroupedMappings;
  //   } else {
  //     network.mappings.edgesDiscrete = newlyGroupedMappings;
  //   }
  //
  //   this.networksParsed = this.networksParsed.filter(x => x.id !== id).concat(network);
  // }

  // /**
  //  * Adds a continuous mapping to the graph
  //  *
  //  * @param id the network's ID
  //  * @param isNode True, if the mapping applies to nodes, false if the mapping applies to edges
  //  * @param continuousMapping newly created mapping
  //  */
  // addMappingContinuous(id: number, isNode: boolean, continuousMapping: NeContinuousThresholds): void {
  //   const network = this.getNetworkById(id);
  //   const styles: NeStyle[] = network.style;
  //
  //   const minPropertyValue: number = continuousMapping.mappedProperty.min;
  //   const maxPropertyValue: number = continuousMapping.mappedProperty.max;
  //
  //   if (this.colorProperties.includes(continuousMapping.cssKey)) {
  //
  //     const colorGradient: NeColorGradient[] = [];
  //
  //     const lowestColor = String(continuousMapping.defaultLower);
  //     const lowest: NeColorGradient = {
  //       numericThreshold: String(Number.MIN_SAFE_INTEGER),
  //       offset: '-1',
  //       color: lowestColor,
  //       title: [continuousMapping.cssKey, continuousMapping.mappedProperty.name]
  //     };
  //
  //     colorGradient.push(lowest);
  //
  //     const greatestColor = String(continuousMapping.defaultGreater);
  //     const greatest: NeColorGradient = {
  //       numericThreshold: String(Number.MAX_SAFE_INTEGER),
  //       offset: '101',
  //       color: greatestColor,
  //       title: [continuousMapping.cssKey, continuousMapping.mappedProperty.name]
  //     };
  //
  //     const range = maxPropertyValue - minPropertyValue;
  //
  //     for (const breakpoint of continuousMapping.breakpoints) {
  //       const diffToLowest = breakpoint.value - minPropertyValue;
  //       const offset = diffToLowest * 100 / range;
  //
  //       const tmp: NeColorGradient = {
  //         numericThreshold: String(breakpoint.value),
  //         color: breakpoint.propertyValue,
  //         offset: String(offset.toFixed(0)) + '%',
  //         title: [continuousMapping.cssKey, continuousMapping.mappedProperty.name]
  //       };
  //       colorGradient.push(tmp);
  //     }
  //     colorGradient.push(greatest);
  //
  //     const finalizedMapping = {
  //       chart: null,
  //       chartValid: false,
  //       colorGradient,
  //       gradientValid: true,
  //       displayChart: false,
  //       title: lowest.title,
  //       values: continuousMapping.mappedProperty.values // is converted to NeStyleComponent[] while setting continuous values
  //     };
  //
  //     if (isNode) {
  //       network.mappings.nodesContinuous = network.mappings.nodesContinuous.concat([finalizedMapping]);
  //       for (const akv of network.aspectKeyValuesNodes) {
  //         if (akv.name === continuousMapping.mappedProperty.name
  //           && !akv.mapPointerC.includes(network.mappings.nodesContinuous.length - 1)) {
  //           akv.mapPointerC.push(network.mappings.nodesContinuous.length - 1);
  //         }
  //       }
  //     } else {
  //       network.mappings.edgesContinuous = network.mappings.edgesContinuous.concat([finalizedMapping]);
  //       for (const akv of network.aspectKeyValuesEdges) {
  //         if (akv.name === continuousMapping.mappedProperty.name
  //           && !akv.mapPointerC.includes(network.mappings.edgesContinuous.length - 1)) {
  //           akv.mapPointerC.push(network.mappings.edgesContinuous.length - 1);
  //         }
  //       }
  //     }
  //   } else {
  //     const chart: NeChart = {
  //       chartType: {
  //         line: true,
  //         bar: false
  //       },
  //       chartData: [{
  //         data: [Number(continuousMapping.defaultLower)],
  //         label: continuousMapping.cssKey
  //       }],
  //       chartLabels: [''],
  //       lineChartOptions: {
  //         scales: {
  //           yAxes: [
  //             {
  //               type: 'linear',
  //               display: true,
  //               position: 'left',
  //               id: 'y-axis-1',
  //             }
  //           ]
  //         },
  //         title: {
  //           display: false,
  //           text: [continuousMapping.cssKey, continuousMapping.mappedProperty.name]
  //         },
  //         elements: {
  //           line: {
  //             tension: 0
  //           }
  //         },
  //         responsive: true,
  //         maintainAspectRatio: true
  //       }
  //     };
  //
  //     for (const breakpoint of continuousMapping.breakpoints) {
  //       chart.chartData[0].data.push(Number(breakpoint.propertyValue));
  //       chart.chartLabels.push(String(breakpoint.value));
  //     }
  //
  //     chart.chartData[0].data.push(Number(continuousMapping.defaultGreater));
  //     chart.chartLabels.push(String(''));
  //
  //     const finalizedMapping = {
  //       chart,
  //       chartValid: true,
  //       colorGradient: null,
  //       gradientValid: false,
  //       displayChart: true,
  //       title: [continuousMapping.cssKey, continuousMapping.mappedProperty.name],
  //       values: continuousMapping.mappedProperty.values
  //     };
  //
  //     if (isNode) {
  //       network.mappings.nodesContinuous = network.mappings.nodesContinuous.concat([finalizedMapping]);
  //       for (const akv of network.aspectKeyValuesNodes) {
  //         if (akv.name === continuousMapping.mappedProperty.name
  //           && !akv.mapPointerC.includes(network.mappings.nodesContinuous.length - 1)) {
  //           akv.mapPointerC.push(network.mappings.nodesContinuous.length - 1);
  //         }
  //       }
  //     } else {
  //       network.mappings.edgesContinuous = network.mappings.edgesContinuous.concat([finalizedMapping]);
  //       for (const akv of network.aspectKeyValuesEdges) {
  //         if (akv.name === continuousMapping.mappedProperty.name
  //           && !akv.mapPointerC.includes(network.mappings.edgesContinuous.length - 1)) {
  //           akv.mapPointerC.push(network.mappings.edgesContinuous.length - 1);
  //         }
  //       }
  //     }
  //   }
  //
  //   network.elements = this.updateElementsContinuously(isNode, continuousMapping, network, minPropertyValue, maxPropertyValue);
  //   network.style = UtilityService.utilOrderStylesByPriority(styles);
  //   this.networksParsed = this.networksParsed.filter(x => x.id !== id).concat(network);
  // }

  /**
   * Removing a property from an existing mapping can only be executed for discrete mappings.
   * It works directly on the cx data and triggers the core rebuild.
   */
  removePropertyFromMapping(): void {
    const mappingName = this.selectedDiscreteMappingProperty.cssKey;
    const isNode = this.selectedTypeHint.nd;

    for (const fd of this.selectedNetwork.cx) {
      if (fd.cyVisualProperties) {
        for (const cvp of fd.cyVisualProperties) {
          if (isNode && cvp.properties_of === 'nodes:default' && cvp.mappings) {
            if (cvp.mappings[mappingName]) {
              delete cvp.mappings[mappingName];
              break;
            }

          } else if (!isNode && cvp.properties_of === 'edges:default' && cvp.mappings) {
            if (cvp.mappings[mappingName]) {
              delete cvp.mappings[mappingName];
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
   * @param mapHint hint containing both typehint and id
   */
  selectMapping(mapHint: string): void {
    this.selectedTypeHint = this.utilityService.utilGetTypeHintByString(mapHint.substr(0, 2));
    const mapId = mapHint.substr(2);
    if (this.selectedTypeHint.nd) {
      this.selectedDiscreteMapping = this.selectedNetwork.mappings.nodesDiscrete[mapId];
      this.selectedContinuousMapping = null;
    } else if (this.selectedTypeHint.ed) {
      this.selectedDiscreteMapping = this.selectedNetwork.mappings.edgesDiscrete[mapId];
      this.selectedContinuousMapping = null;
    } else if (this.selectedTypeHint.nc) {
      this.selectedContinuousMapping = this.selectedNetwork.mappings.nodesContinuous[mapId];
      this.selectedDiscreteMapping = null;
    } else if (this.selectedTypeHint.ec) {
      this.selectedContinuousMapping = this.selectedNetwork.mappings.edgesContinuous[mapId];
      this.selectedDiscreteMapping = null;
    }
  }

  /**
   * Selects a property within a grouped discrete mapping.
   * Call this with null to unselect the currently selected mapping property.
   * @param propertyId id of the specified style, or null to unselect
   */
  selectDiscreteMappingProperty(propertyId: number): void {
    if (propertyId === null) {
      this.selectedDiscreteMappingProperty = null;
      return;
    }

    if (!this.selectedDiscreteMapping) {
      console.log('No discrete mapping selected');
      return;
    }
    this.selectedDiscreteMappingProperty = this.selectedDiscreteMapping.styleMap[propertyId];
  }

  /**
   * Resets a selected discrete mapping property
   */
  resetDiscreteMappingPropertySelection(): void {
    this.selectedDiscreteMappingProperty = null;
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

}
