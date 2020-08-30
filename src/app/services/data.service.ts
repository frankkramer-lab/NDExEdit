import {Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import {NeMappingsDefinition} from '../models/ne-mappings-definition';
import {NeStyle} from '../models/ne-style';
import {NeNode} from '../models/ne-node';
import {NeEdge} from '../models/ne-edge';
import {NeGroupedMappingsDiscrete} from '../models/ne-grouped-mappings-discrete';
import {NeContinuousThresholds} from '../models/ne-continuous-thresholds';
import {NeColorGradient} from '../models/ne-color-gradient';
import {NeContinuousMap} from '../models/ne-continuous-map';
import {NeThresholdMap} from '../models/ne-threshold-map';
import {NeContinuousChart} from '../models/ne-continuous-chart';
import {ElementDefinition} from 'cytoscape';
import {UtilityService} from './utility.service';
import {NeMappingsMap} from '../models/ne-mappings-map';
import {NeStyleMap} from '../models/ne-style-map';

@Injectable({
  providedIn: 'root'
})

/**
 * Service containing globally accessible data and providing manipulations
 */
export class DataService {

  constructor() {
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
   * List of known color properties, mainly used for color previews within {@link MainMappingsNewComponent}
   */
  colorProperties: string[] = [
    'background-color',
    'border-color',
    'line-color',
    'target-arrow-color',
    'source-arrow-color',
  ];

  /**
   * After adding a discrete mapping all newly set values have to be aggregated into a nicely displayable mapping
   *
   * @param discreteMapping Newly created mapping
   * @param mappings Existing mappings
   * @param isNode True if the mapping applies to nodes, false if the mapping applies to edges
   * @private
   */
  private static updateMappings(discreteMapping: NeMappingsDefinition[],
                                mappings: NeMappingsMap,
                                isNode: boolean): NeGroupedMappingsDiscrete[] {

    if (!mappings || discreteMapping.length === 0) {
      return [];
    }
    let groupedMappings: NeGroupedMappingsDiscrete[];
    if (isNode) {
      groupedMappings = mappings.nodesDiscrete;
    } else {
      groupedMappings = mappings.edgesDiscrete;
    }

    const dmCssValues: string[] = [];
    const dmSelectors: string[] = [];
    for (const dm of discreteMapping) {
      dmCssValues.push(dm.cssValue);
      dmSelectors.push(dm.selector);
    }

    const styleMap: NeStyleMap = {
      cssKey: discreteMapping[0].cssKey,
      cssValues: dmCssValues,
      selectors: dmSelectors
    };

    let found = false;
    for (const elementMap of groupedMappings) {
      if (discreteMapping[0].colHR === elementMap.classifier) {
        found = true;
        elementMap.th.push(discreteMapping[0].cssKey);

        for (const dm of discreteMapping) {
          const writeToIndex = elementMap.selectors.indexOf(dm.selector);
          if (writeToIndex === -1) {
            // value is not yet in list of values and needs adding => just push to last
            elementMap.selectors.push(dm.selector);
            elementMap.values.push(dm.isHR);
          }
        }

        if (!elementMap.styleMap.includes(styleMap)) {
          elementMap.styleMap.push(styleMap);
        }
      }
    }

    if (!found) {
      const dmValues: string[] = [];
      const dmTh: string[] = [];
      for (const dm of discreteMapping) {
        if (!dmValues.includes(dm.isHR)) {
          dmValues.push(dm.isHR);
        }
        if (!dmTh.includes(dm.cssKey)) {
          dmTh.push(dm.cssKey);
        }
      }
      const newElementMap: NeGroupedMappingsDiscrete = {
        classifier: discreteMapping[0].colHR,
        values: dmValues,
        styleMap: [styleMap],
        th: dmTh,
        selectors: dmSelectors,
      };
      groupedMappings.push(newElementMap);
    }
    return groupedMappings;

  }

  /**
   * Adds a style object to the graph's existing style
   *
   * @param existingStyle the graph's current style
   * @param styleObj newly created style
   * @private
   */
  private static addPropertyToStyle(existingStyle: NeStyle, styleObj: NeStyle): NeStyle {
    const keys = Object.keys(styleObj.style);
    for (const k of keys) {
      existingStyle.style[k] = styleObj.style[k];
    }
    return existingStyle;
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
   * @param map The specified discrete mappping
   */
  removeMapping(map: any): void {

    const network = this.getNetworkById(map.network);

    switch (map.type) {
      case 'nd':
        const ndSelectors = network.mappings.nodesDiscrete[map.mappingId].selectors;
        network.mappings.nodesDiscrete.splice(map.mappingId, 1);
        const ndNewStyle = network.style.filter(x => !ndSelectors.includes(x.selector));

        for (const selector of ndSelectors) {
          const className = selector.substring(1);
          for (const element of network.elements) {

            if (element.classes.includes(className)) {
              element.data.classes = element.data.classes.filter(x => x !== className);
              element.classes = element.classes.replace(className, '').trim();
            }
          }
        }

        network.style = ndNewStyle;
        network.aspectKeyValuesNodes[map.akvIndex].mapPointerD = network
          .aspectKeyValuesNodes[map.akvIndex]
          .mapPointerD
          .filter(x => x !== map.mappingId);

        for (const akv of network.aspectKeyValuesNodes) {
          akv.mapPointerD = akv.mapPointerD.map(x => x > map.mappingId ? --x : x);
        }
        break;

      case 'nc':
        const nodeAkvs = network.aspectKeyValuesNodes;
        const nodeElements = network.elements;
        const nodeStyle = network.style;
        let updatedNodeStyle = nodeStyle;

        for (const s of nodeStyle) {
          for (const node of nodeElements) {

            if (node.group === 'nodes') {
              const currentSelector = '.node_' + node.data.id;

              if (s.selector === currentSelector) {
                delete s.style[map.map.title[0]];

                if (Object.keys(s.style).length === 0) {
                  updatedNodeStyle = updatedNodeStyle.filter(x => x !== s);
                }
              }
            }
          }
        }

        if (nodeAkvs[map.akvIndex].mapPointerC.includes(map.mappingId)) {
          nodeAkvs[map.akvIndex].mapPointerC = nodeAkvs[map.akvIndex].mapPointerC.filter(x => x !== map.mappingId);
        }

        network.style = updatedNodeStyle;
        network.elements = nodeElements;
        network.aspectKeyValuesNodes = nodeAkvs;
        network.mappings.nodesContinuous
          = network.mappings.nodesContinuous.filter(x => network.mappings.nodesContinuous.indexOf(x) !== map.mappingId);

        for (const akv of network.aspectKeyValuesNodes) {
          akv.mapPointerC = akv.mapPointerC.map(x => x > map.mappingId ? --x : x);
        }

        this.networksParsed = this.networksParsed.filter(x => x.id !== map.network).concat(network);
        break;

      case 'ed':

        const edSelectors = network.mappings.edgesDiscrete[map.mappingId].selectors;
        network.mappings.edgesDiscrete.splice(map.mappingId, 1);
        const edNewStyle = network.style.filter(x => !edSelectors.includes(x.selector));

        for (const selector of edSelectors) {
          const className = selector.substring(1);
          for (const element of network.elements) {

            if (element.classes.includes(className)) {
              element.classes = element.classes.replace(className, '').trim();
            }
          }
        }

        network.style = edNewStyle;
        network.aspectKeyValuesEdges[map.akvIndex].mapPointerD = network
          .aspectKeyValuesEdges[map.akvIndex]
          .mapPointerD
          .filter(x => x !== map.mappingId);

        for (const akv of network.aspectKeyValuesEdges) {
          akv.mapPointerD = akv.mapPointerD.map(x => x > map.mappingId ? --x : x);
        }
        break;

      case 'ec':

        const edgeAkvs = network.aspectKeyValuesEdges;
        const edgeElements = network.elements;
        const edgeStyle = network.style;
        let updatedEdgeStyle = edgeStyle;

        for (const s of edgeStyle) {
          for (const edge of edgeElements) {

            if (edge.group === 'edges') {
              const currentSelector = '.edge_' + edge.data.id;

              if (s.selector === currentSelector) {
                delete s.style[map.map.title[0]];

                if (Object.keys(s.style).length === 0) {
                  updatedEdgeStyle = updatedEdgeStyle.filter(x => x !== s);
                }
              }
            }
          }
        }

        if (edgeAkvs[map.akvIndex].mapPointerC.includes(map.mappingId)) {
          edgeAkvs[map.akvIndex].mapPointerC = edgeAkvs[map.akvIndex].mapPointerC.filter(x => x !== map.mappingId);
        }

        network.style = updatedEdgeStyle;
        network.elements = edgeElements;
        network.aspectKeyValuesEdges = edgeAkvs;
        network.mappings.edgesContinuous
          = network.mappings.edgesContinuous.filter(x => network.mappings.edgesContinuous.indexOf(x) !== map.mappingId);

        for (const akv of network.aspectKeyValuesEdges) {
          akv.mapPointerC = akv.mapPointerC.map(x => x > map.mappingId ? --x : x);
        }

        this.networksParsed = this.networksParsed.filter(x => x.id !== map.network).concat(network);
        break;
    }
  }

  /**
   * Adds a new mapping to an already parsed network
   * @param id The network's id
   * @param isNode Indicates if the type to which the mapping belongs is a {@link NeNode|node}
   * @param discreteMapping The specified mapping which is filled in {@link MainMappingsNewComponent}
   */
  addMappingDiscrete(id: number, isNode: boolean, discreteMapping: NeMappingsDefinition[]): void {
    const network = this.getNetworkById(id);
    const styles: NeStyle[] = network.style;
    const elements = network.elements;

    for (const map of discreteMapping) {

      if (map.cssValue !== '') {

        const styleProperty = {};
        styleProperty[map.cssKey] = map.cssValue;
        const styleMap: NeStyle = {
          selector: map.selector,
          style: styleProperty,
          appliedTo: [],
          priority: map.priority
        };

        for (const element of elements) {
          for (const attribute of element.data.attributes) {
            if (attribute.key === map.col && attribute.value === map.is && !element.data.classes.includes(map.selector.substring(1))) {
              element.data.classes.push(map.selector.substring(1));
              element.classes = element.data.classes.join(' ');
              if (isNode && !styleMap.appliedTo.includes(element.data as NeNode)) {
                styleMap.appliedTo.push(element.data as NeNode);
                break;
              } else if (!styleMap.appliedTo.includes(element.data as NeEdge)) {
                styleMap.appliedTo.push(element.data as NeEdge);
                break;
              }
            } else if (attribute.key === map.col) {
              const tmpSelector = (isNode ? 'node_' : 'edge_') + attribute.key + '_' + attribute.value;
              if (!element.data.classes.includes(tmpSelector)) {
                element.data.classes.push(tmpSelector);
                element.classes = element.data.classes.join(' ');
              }
            }
          }
        }
        if (!styles.includes(styleMap)) {
          let found = false;
          for (const s of styles) {
            if (s.selector === styleMap.selector) {
              found = true;
              s.style[map.cssKey] = map.cssValue;
            }
          }
          if (!found) {
            styles.push(styleMap);
          }
        }
      }
    }

    network.style = UtilityService.utilOrderStylesByPriority(styles);
    network.elements = elements;

    if (isNode) {
      // check if we need to update mappointers
      let changeMapPointerNodes = true;
      for (const nodeMap of network.mappings.nodesDiscrete) {
        if (nodeMap.classifier === discreteMapping[0].colHR) {
          changeMapPointerNodes = false;
          break;
        }
      }

      if (changeMapPointerNodes) {
        for (const akv of network.aspectKeyValuesNodes) {
          if (akv.name === discreteMapping[0].colHR
            && !akv.mapPointerD.includes(network.mappings.nodesDiscrete.length)) {
            akv.mapPointerD.push(network.mappings.nodesDiscrete.length);
          }
        }
      }


    } else {
      let changeMapPointerEdges = true;

      for (const edgeMap of network.mappings.edgesDiscrete) {
        if (edgeMap.classifier === discreteMapping[0].colHR) {
          changeMapPointerEdges = false;
          break;
        }
      }

      if (changeMapPointerEdges) {
        for (const akv of network.aspectKeyValuesEdges) {
          if (akv.name === discreteMapping[0].colHR && !akv.mapPointerD.includes(network.mappings.edgesDiscrete.length)) {
            akv.mapPointerD.push(network.mappings.edgesDiscrete.length);
          }
        }
      }

    }

    const newlyGroupedMappings = DataService.updateMappings(discreteMapping, network.mappings, isNode);
    if (isNode) {
      network.mappings.nodesDiscrete = newlyGroupedMappings;
    } else {
      network.mappings.edgesDiscrete = newlyGroupedMappings;
    }

    this.networksParsed = this.networksParsed.filter(x => x.id !== id).concat(network);
  }

  /**
   * Adds a continuous mapping to the graph
   *
   * @param id the network's ID
   * @param isNode True, if the mapping applies to nodes, false if the mapping applies to edges
   * @param continuousMapping newly created mapping
   */
  addMappingContinuous(id: number, isNode: boolean, continuousMapping: NeContinuousThresholds): void {
    const network = this.getNetworkById(id);
    const styles: NeStyle[] = network.style;

    const minPropertyValue: number = continuousMapping.mappedProperty.min;
    const maxPropertyValue: number = continuousMapping.mappedProperty.max;

    if (this.colorProperties.includes(continuousMapping.cssKey)) {

      const colorGradient: NeColorGradient[] = [];

      const lowestColor = String(continuousMapping.defaultLower);
      const lowest: NeColorGradient = {
        numericThreshold: String(Number.MIN_SAFE_INTEGER),
        offset: '-1',
        color: lowestColor,
        title: [continuousMapping.cssKey, continuousMapping.mappedProperty.name]
      };

      colorGradient.push(lowest);

      const greatestColor = String(continuousMapping.defaultGreater);
      const greatest: NeColorGradient = {
        numericThreshold: String(Number.MAX_SAFE_INTEGER),
        offset: '101',
        color: greatestColor,
        title: [continuousMapping.cssKey, continuousMapping.mappedProperty.name]
      };

      const range = maxPropertyValue - minPropertyValue;

      for (const breakpoint of continuousMapping.breakpoints) {
        const diffToLowest = breakpoint.value - minPropertyValue;
        const offset = diffToLowest * 100 / range;

        const tmp: NeColorGradient = {
          numericThreshold: String(breakpoint.value),
          color: breakpoint.propertyValue,
          offset: String(offset.toFixed(0)) + '%',
          title: [continuousMapping.cssKey, continuousMapping.mappedProperty.name]
        };
        colorGradient.push(tmp);
      }
      colorGradient.push(greatest);

      const finalizedMapping = {
        chart: null,
        chartValid: false,
        colorGradient,
        gradientValid: true,
        displayChart: false,
        title: lowest.title,
        values: continuousMapping.mappedProperty.values
      };

      if (isNode) {
        network.mappings.nodesContinuous = network.mappings.nodesContinuous.concat([finalizedMapping]);
        for (const akv of network.aspectKeyValuesNodes) {
          if (akv.name === continuousMapping.mappedProperty.name
            && !akv.mapPointerC.includes(network.mappings.nodesContinuous.length - 1)) {
            akv.mapPointerC.push(network.mappings.nodesContinuous.length - 1);
          }
        }
      } else {
        network.mappings.edgesContinuous = network.mappings.edgesContinuous.concat([finalizedMapping]);
        for (const akv of network.aspectKeyValuesEdges) {
          if (akv.name === continuousMapping.mappedProperty.name
            && !akv.mapPointerC.includes(network.mappings.edgesContinuous.length - 1)) {
            akv.mapPointerC.push(network.mappings.edgesContinuous.length - 1);
          }
        }
      }
    } else {
      const chart: NeContinuousChart = {
        lineChartData: [{
          data: [Number(continuousMapping.defaultLower)],
          label: continuousMapping.cssKey
        }],
        lineChartLabels: [''],
        lineChartOptions: {
          scales: {
            yAxes: [
              {
                type: 'linear',
                display: true,
                position: 'left',
                id: 'y-axis-1',
              }
            ]
          },
          title: {
            display: false,
            text: [continuousMapping.cssKey, continuousMapping.mappedProperty.name]
          },
          elements: {
            line: {
              tension: 0
            }
          },
          responsive: true,
          maintainAspectRatio: true
        }
      };

      for (const breakpoint of continuousMapping.breakpoints) {
        chart.lineChartData[0].data.push(Number(breakpoint.propertyValue));
        chart.lineChartLabels.push(String(breakpoint.value));
      }

      chart.lineChartData[0].data.push(Number(continuousMapping.defaultGreater));
      chart.lineChartLabels.push(String(''));

      const finalizedMapping = {
        chart,
        chartValid: true,
        colorGradient: null,
        gradientValid: false,
        displayChart: true,
        title: [continuousMapping.cssKey, continuousMapping.mappedProperty.name],
        values: continuousMapping.mappedProperty.values
      };

      if (isNode) {
        network.mappings.nodesContinuous = network.mappings.nodesContinuous.concat([finalizedMapping]);
        for (const akv of network.aspectKeyValuesNodes) {
          if (akv.name === continuousMapping.mappedProperty.name
            && !akv.mapPointerC.includes(network.mappings.nodesContinuous.length - 1)) {
            akv.mapPointerC.push(network.mappings.nodesContinuous.length - 1);
          }
        }
      } else {
        network.mappings.edgesContinuous = network.mappings.edgesContinuous.concat([finalizedMapping]);
        for (const akv of network.aspectKeyValuesEdges) {
          if (akv.name === continuousMapping.mappedProperty.name
            && !akv.mapPointerC.includes(network.mappings.edgesContinuous.length - 1)) {
            akv.mapPointerC.push(network.mappings.edgesContinuous.length - 1);
          }
        }
      }
    }

    network.elements = this.updateElementsContinuously(isNode, continuousMapping, network, minPropertyValue, maxPropertyValue);
    network.style = UtilityService.utilOrderStylesByPriority(styles);
    this.networksParsed = this.networksParsed.filter(x => x.id !== id).concat(network);
  }

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
  private updateElementsContinuously(isNode: boolean,
                                     continuousMapping: any,
                                     network: NeNetwork,
                                     minPropertyValue,
                                     maxPropertyValue): ElementDefinition[] {
    const styles: NeStyle[] = network.style;
    const elements: ElementDefinition[] = network.elements;

    for (const element of elements) {
      if (isNode ? element.group === 'nodes' : element.group === 'edges') {
        for (const attribute of element.data.attributes) {
          if (attribute.keyHR === continuousMapping.mappedProperty.name) {
            const elementValue = Number(attribute.valueHR);

            let index = 0;
            while (continuousMapping.breakpoints.length > index && continuousMapping.breakpoints[index].value < elementValue) {
              index++;
            }

            const selector = ((isNode) ? '.node_' : '.edge_') + element.data.id;
            const style = styles.find(x => x.selector === selector);

            const tmpData = (isNode ? [element.data as NeNode] : [element.data as NeEdge]);

            const styleObj: NeStyle = {
              selector,
              style: {},
              appliedTo: tmpData,
              priority: 2
            };

            if (!element.data.classes.includes(selector.substring(1))) {
              element.data.classes.push(selector.substring(1));
              element.classes = element.data.classes.join(' ');
            }

            if (continuousMapping.breakpoints[index] && continuousMapping.breakpoints[index].value === elementValue) {
              // case 1: element hits breakpoint threshold => apply threshold value
              styleObj.style[continuousMapping.cssKey] = continuousMapping.breakpoints[index].propertyValue;

            } else if (index === 0 && continuousMapping.breakpoints[index] && continuousMapping.breakpoints[index].value > elementValue) {
              // case 2: element is smaller than lowest threshold => apply relatively lower
              const inputMap: NeContinuousMap = {
                inputValue: String(elementValue),
                lowerThreshold: String(minPropertyValue),
                lower: continuousMapping.defaultLower,
                greaterThreshold: String(continuousMapping.breakpoints[index].value),
                greater: String(continuousMapping.breakpoints[index].propertyValue)
              };


              styleObj.style[continuousMapping.cssKey] = UtilityService.utilCalculateRelativeValue(inputMap);

            } else if (continuousMapping.breakpoints[index] && continuousMapping.breakpoints[index].value > elementValue) {
              // case 3: element lower than the current breakpoint =>
              // calculate relative value between two breakpoints or lowest default and current breakpoint
              let limitLow: NeThresholdMap;
              if (index === 0) {
                limitLow = {
                  value: minPropertyValue,
                  propertyValue: continuousMapping.defaultLower
                };
              } else {
                limitLow = continuousMapping.breakpoints[index - 1];
              }

              const limitHigh = continuousMapping.breakpoints[index];
              const inputMap: NeContinuousMap = {
                inputValue: String(elementValue),
                lowerThreshold: String(limitLow.value),
                lower: String(limitLow.propertyValue),
                greaterThreshold: String(limitHigh.value),
                greater: String(limitHigh.propertyValue)
              };

              styleObj.style[continuousMapping.cssKey] = UtilityService.utilCalculateRelativeValue(inputMap);

            } else if (index === continuousMapping.breakpoints.length && index > 0
              && elementValue > continuousMapping.breakpoints[index - 1].value) {
              // case 4: maxxed out index and elements value still greater => apply relatively greater
              const inputMap: NeContinuousMap = {
                inputValue: String(elementValue),
                lowerThreshold: String(continuousMapping.breakpoints[index - 1].value),
                lower: String(continuousMapping.breakpoints[index - 1].propertyValue),
                greaterThreshold: String(maxPropertyValue),
                greater: String(continuousMapping.defaultGreater)
              };

              styleObj.style[continuousMapping.cssKey] = UtilityService.utilCalculateRelativeValue(inputMap);

            } else if (index === 0 && index === continuousMapping.breakpoints.length) {
              const inputMap: NeContinuousMap = {
                inputValue: String(elementValue),
                lowerThreshold: String(minPropertyValue),
                lower: String(continuousMapping.defaultLower),
                greaterThreshold: String(maxPropertyValue),
                greater: String(continuousMapping.defaultGreater)
              };

              styleObj.style[continuousMapping.cssKey] = UtilityService.utilCalculateRelativeValue(inputMap);
            }

            if (!style) {
              styles.push(styleObj);
            } else {
              network.style = styles.filter(x => x !== style).concat(DataService.addPropertyToStyle(style, styleObj));
            }
          }
        }
      }
    }
    return elements;
  }


  /**
   * Removing a property from an existing mapping can only be executed for discrete mappings
   *
   * @param id The network's id
   * @param property Property to remove
   */
  removePropertyFromMapping(id: number, property: { mapReference: number; attributeName: string; mapType: string; style: any }): void {
    const network = this.getNetworkById(id);
    const isNode = property.mapType.startsWith('n');
    const mapping: NeGroupedMappingsDiscrete = isNode
      ? network.mappings.nodesDiscrete[property.mapReference]
      : network.mappings.edgesDiscrete[property.mapReference];

    mapping.th = mapping.th.filter(x => x !== property.style.cssKey);
    mapping.styleMap = mapping.styleMap.filter(x => x !== property.style);

    for (const selector of mapping.selectors) {
      for (const s of network.style) {
        if (s.selector === selector) {
          delete s.style[property.style.cssKey];

        }
      }
    }
  }

  /**
   * Edits an existing mapping, usable for both discrete and contiuous mappings
   *
   * @param id network's id
   * @param mappingToEdit updated mapping
   * @param styleProperty corresponding style from within the network's existing style
   * @param mappingsType true for type of mapping
   */
  editMapping(id: number,
              mappingToEdit: any | any[],
              styleProperty: string,
              mappingsType: { nc: boolean; nd: boolean; ec: boolean; ed: boolean }): void {
    const network = this.getNetworkById(id);
    if (mappingsType.nd) {

      const existingNdMappingIndex = network.mappings.nodesDiscrete.findIndex(x => x.classifier === mappingToEdit[0].colHR
        && x.styleMap.map(a => a.cssKey).includes(mappingToEdit[0].cssKey));
      const existingNdMapping = network.mappings.nodesDiscrete[existingNdMappingIndex];
      const correspondingStyleMapNd = existingNdMapping.styleMap.find(x => x.cssKey === mappingToEdit[0].cssKey);
      const ndMappingsNotFound = [];
      const ndStyles: NeStyle[] = network.style;

      for (const map of mappingToEdit) {
        const currentSelector = map.selector;
        let found = false;
        for (let i = 0; i < correspondingStyleMapNd.cssValues.length; i++) {
          if (correspondingStyleMapNd.selectors[i] === currentSelector) {
            correspondingStyleMapNd.cssValues[i] = map.cssValue;
            found = true;
          }
        }
        if (!found) {
          ndMappingsNotFound.push(map);
          correspondingStyleMapNd.cssValues.push(map.cssValue);
          correspondingStyleMapNd.selectors.push(currentSelector);
        }
      }
      for (let i = 0; i < correspondingStyleMapNd.selectors.length; i++) {
        let found = false;
        for (const s of network.style) {
          if (s.selector === correspondingStyleMapNd.selectors[i]) {
            found = true;
            s.style[correspondingStyleMapNd.cssKey] = correspondingStyleMapNd.cssValues[i];
          }
        }
        if (!found) {
          const newStyle: NeStyle = {
            selector: correspondingStyleMapNd.selectors[i],
            style: {},
            appliedTo: [],
            priority: UtilityService.utilfindPriorityBySelector(correspondingStyleMapNd.selectors[i]),
          };
          newStyle.style[correspondingStyleMapNd.cssKey] = correspondingStyleMapNd.cssValues[i];

          for (const map of ndMappingsNotFound) {
            for (const element of network.elements) {
              if (element.group === 'nodes') {
                for (const attribute of element.data.attributes) {
                  if (attribute.keyHR === map.colHR && attribute.valueHR === map.isHR) {
                    element.data.classes.push(map.selector.substring(1));
                    element.classes = element.data.classes.join(' ');
                    newStyle.appliedTo.push(element.data as NeNode);
                  }
                }
              }
              for (const nodeMap of network.mappings.nodesDiscrete) {
                if (nodeMap.classifier === map.colHR) {
                  if (!nodeMap.selectors.includes(map.selector)) {
                    nodeMap.selectors.push(map.selector);
                  }
                  if (!nodeMap.values.includes(map.isHR)) {
                    nodeMap.values.push(map.isHR);
                  }
                }
              }
            }
          }
          network.style = UtilityService.utilOrderStylesByPriority(ndStyles.concat([newStyle]));
        }
      }

    } else if (mappingsType.ed) {

      const existingEdMappingIndex = network.mappings.edgesDiscrete.findIndex(x => x.classifier === mappingToEdit[0].colHR
        && x.styleMap.map(a => a.cssKey).includes(mappingToEdit[0].cssKey));
      const existingEdMapping = network.mappings.edgesDiscrete[existingEdMappingIndex];
      const correspondingStyleMapEd = existingEdMapping.styleMap.find(x => x.cssKey === mappingToEdit[0].cssKey);
      const edMappingsNotFound = [];
      const edStyles: NeStyle[] = network.style;

      for (const map of mappingToEdit) {
        let found = false;
        const currentSelector = map.selector;
        for (let i = 0; i < correspondingStyleMapEd.cssValues.length; i++) {
          if (correspondingStyleMapEd.selectors[i] === currentSelector) {
            correspondingStyleMapEd.cssValues[i] = map.cssValue;
            found = true;
          }
        }
        if (!found) {
          edMappingsNotFound.push(map);
          correspondingStyleMapEd.cssValues.push(map.cssValue);
          correspondingStyleMapEd.selectors.push(currentSelector);
        }
      }

      for (let i = 0; i < correspondingStyleMapEd.selectors.length; i++) {
        let found = false;
        for (const s of network.style) {
          if (s.selector === correspondingStyleMapEd.selectors[i]) {
            found = true;
            s.style[correspondingStyleMapEd.cssKey] = correspondingStyleMapEd.cssValues[i];
          }
        }
        if (!found) {
          const newStyle: NeStyle = {
            selector: correspondingStyleMapEd.selectors[i],
            style: {},
            appliedTo: [],
            priority: UtilityService.utilfindPriorityBySelector(correspondingStyleMapEd.selectors[i]),
          };
          newStyle.style[correspondingStyleMapEd.cssKey] = correspondingStyleMapEd.cssValues[i];

          for (const map of edMappingsNotFound) {
            for (const element of network.elements) {
              if (element.group === 'edges') {
                for (const attribute of element.data.attributes) {
                  if (attribute.keyHR === map.colHR && attribute.valueHR === map.isHR) {
                    element.data.classes.push(map.selector.substring(1));
                    element.classes = element.data.classes.join(' ');
                    newStyle.appliedTo.push(element.data as NeEdge);
                  }
                }
              }
              for (const edgeMap of network.mappings.edgesDiscrete) {
                if (edgeMap.classifier === map.colHR) {
                  if (!edgeMap.selectors.includes(map.selector)) {
                    edgeMap.selectors.push(map.selector);
                  }
                  if (!edgeMap.values.includes(map.isHR)) {
                    edgeMap.values.push(map.isHR);
                  }
                }
              }
            }
          }
          network.style = UtilityService.utilOrderStylesByPriority(edStyles.concat([newStyle]));

        }
      }

    } else if (mappingsType.nc) {
      // all selectors are there, but thresholds need to be re-calculated
      mappingToEdit.breakpoints = mappingToEdit.breakpoints.filter(x => x.value !== null);
      mappingToEdit.breakpoints = mappingToEdit.breakpoints.sort((a, b) => a.value > b.value ? 1 : -1);


      const existingNcMappingIndex = network.mappings.nodesContinuous.findIndex(x => x.title[0] === mappingToEdit.cssKey
        && x.title[1] === mappingToEdit.mappedProperty.name);
      const existingNcMapping = network.mappings.nodesContinuous[existingNcMappingIndex];
      const ncAkv = network.aspectKeyValuesNodes.find(x => x.name === existingNcMapping.title[1]);

      if (existingNcMapping.chartValid) {

        existingNcMapping.chart.lineChartData[0].data[0] = mappingToEdit.defaultLower;
        existingNcMapping.chart.lineChartData[0].data[mappingToEdit.breakpoints.length + 1] = mappingToEdit.defaultGreater;

        for (let i = 0; i < mappingToEdit.breakpoints.length; i++) {
          existingNcMapping.chart.lineChartData[0].data[1 + i] = mappingToEdit.breakpoints[i].propertyValue;
          existingNcMapping.chart.lineChartLabels[1 + i] = mappingToEdit.breakpoints[i].value;
        }
        existingNcMapping.chart.lineChartLabels.push('');

      } else if (existingNcMapping.gradientValid) {

        const min = ncAkv.min;
        const max = ncAkv.max;
        const range = max - min;

        const newNcMapping = existingNcMapping;
        const title = existingNcMapping.colorGradient[0].title;
        newNcMapping.colorGradient = [];

        for (const breakpoint of mappingToEdit.breakpoints) {
          newNcMapping.colorGradient.push({
            color: breakpoint.propertyValue,
            numericThreshold: breakpoint.value,
            offset: String((Number(breakpoint.value) - min) * 100 / range) + '%',
            title,
          });
        }

        newNcMapping.colorGradient = [{
          color: mappingToEdit.defaultLower,
          numericThreshold: String(Number.MIN_SAFE_INTEGER),
          offset: '-1',
          title
        }].concat(newNcMapping.colorGradient);

        newNcMapping.colorGradient.push({
          color: mappingToEdit.defaultGreater,
          numericThreshold: String(Number.MAX_SAFE_INTEGER),
          offset: '101',
          title
        });

      }
      network.elements = this.updateElementsContinuously(true,
        mappingToEdit, network, Number(mappingToEdit.mappedProperty.min), Number(mappingToEdit.mappedProperty.max));

    } else if (mappingsType.ec) {
      mappingToEdit.breakpoints = mappingToEdit.breakpoints.filter(x => x.value !== null);
      mappingToEdit.breakpoints = mappingToEdit.breakpoints.sort((a, b) => a.value > b.value ? 1 : -1);

      const existingEcMappingIndex = network.mappings.edgesContinuous.findIndex(x => x.title[0] === mappingToEdit.cssKey
        && x.title[1] === mappingToEdit.mappedProperty.name);
      const existingEcMapping = network.mappings.edgesContinuous[existingEcMappingIndex];
      const ecAkv = network.aspectKeyValuesEdges.find(x => x.name === existingEcMapping.title[1]);

      if (existingEcMapping.chartValid) {
        // update chart
        existingEcMapping.chart.lineChartData[0].data[0] = mappingToEdit.defaultLower;
        existingEcMapping.chart.lineChartData[0].data[mappingToEdit.breakpoints.length + 1] = mappingToEdit.defaultGreater;

        for (let i = 0; i < mappingToEdit.breakpoints.length; i++) {
          existingEcMapping.chart.lineChartData[0].data[1 + i] = mappingToEdit.breakpoints[i].propertyValue;
          existingEcMapping.chart.lineChartLabels[1 + i] = mappingToEdit.breakpoints[i].value;
        }
        existingEcMapping.chart.lineChartLabels.push('');
      } else if (existingEcMapping.gradientValid) {

        const min = ecAkv.min;
        const max = ecAkv.max;
        const range = max - min;

        const newEcMapping = existingEcMapping;
        const title = existingEcMapping.colorGradient[0].title;
        newEcMapping.colorGradient = [];

        for (const breakpoint of mappingToEdit.breakpoints) {
          newEcMapping.colorGradient.push({
            color: breakpoint.propertyValue,
            numericThreshold: breakpoint.value,
            offset: String((Number(breakpoint.value) - min) * 100 / range) + '%',
            title,
          });
        }

        newEcMapping.colorGradient = [{
          color: mappingToEdit.defaultLower,
          numericThreshold: String(Number.MIN_SAFE_INTEGER),
          offset: '-1',
          title
        }].concat(newEcMapping.colorGradient);

        newEcMapping.colorGradient.push({
          color: mappingToEdit.defaultGreater,
          numericThreshold: String(Number.MAX_SAFE_INTEGER),
          offset: '101',
          title
        });

      }
      network.elements = this.updateElementsContinuously(false,
        mappingToEdit, network, Number(mappingToEdit.mappedProperty.min), Number(mappingToEdit.mappedProperty.max));

    }
  }
}
