import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as cytoscape from 'cytoscape';
import {ElementDefinition, ElementGroup} from 'cytoscape';
import {NeConversionMap} from '../models/ne-conversion-map';
import {NeStyle} from '../models/ne-style';
import {NeNode} from '../models/ne-node';
import {NeElementAttribute} from '../models/ne-element-attribute';
import {NeEdge} from '../models/ne-edge';
import {NePosition} from '../models/ne-position';
import {NeStyleComponent} from '../models/ne-style-component';
import {NeMappingsDefinition} from '../models/ne-mappings-definition';
import {NeMappingsCollection} from '../models/ne-mappings-collection';
import {NeMappings} from '../models/ne-mappings';
import {NeNetworkInformation} from '../models/ne-network-information';
import {NeNetwork} from '../models/ne-network';
import {NeElement} from '../models/ne-element';
import {NeContinuousMap} from '../models/ne-continuous-map';
import {NeGlobalMappings} from '../models/ne-global-mappings';
import {NeAspect} from '../models/ne-aspect';
import {NeGroupedMappingsDiscrete} from '../models/ne-grouped-mappings-discrete';
import {NeContinuousCollection} from '../models/ne-continuous-collection';
import {NeColorGradient} from '../models/ne-color-gradient';
import {UtilityService} from './utility.service';

@Injectable({
  providedIn: 'root'
})

/**
 * Service for parsing of .cx and cytoscape files
 */
export class ParseService {

  constructor(public http: HttpClient) {
    this.http.get(this.lookupFilePath.concat(this.lookupFileName))
      .toPromise()
      .then((fileContent: any) => {
        this.lookupData = fileContent;
      })
      .catch(error => console.error(error));
  }

  /**
   * id used for networks in {@link GraphService#networksParsed|networksParsed}
   * @private
   */
  private id = 0;

  /**
   * filepath to lookup file
   * @private
   */
  private readonly lookupFilePath = 'assets/';

  /**
   * filename of lookup file
   * @private
   */
  private readonly lookupFileName = 'lookup.json';

  /**
   * data of lookup file
   * @private
   */
  private lookupData: NeConversionMap[];

  // /**
  //  * Utility method for removing any whitespace and round brackets from a string; also casts to lower case
  //  *
  //  * @param input string to be cleaned
  //  * @returns cleaned string
  //  */
  // public static utilCleanString(input: string): string {
  //   if (!input) {
  //     return '';
  //   }
  //   input = String(input);
  //   return input.replace(/\s*\(*\)*\.*/g, '').toLowerCase();
  // }

  /**
   * Method for parsing node data. See {@link NeNode|NeNode} for further info on format
   * @param readData input data
   */
  private static parseNodeData(readData: any): NeNode[] {
    const nodeData: NeNode[] = [];

    for (const entry of readData) {
      const obj: NeNode = {
        id: String(entry['@id']),
        group: 'nodes',
        name: entry.n,
        reference: entry.r || null,
        attributes: null,
        classes: [],
      };
      nodeData.push(obj);
    }
    return nodeData;
  }

  /**
   * Method for parsing node attribute data. See {@link NeElementAttribute|NeElementAttribute} for further info on format
   * @param readData input data
   * @param nodeData raw node data
   */
  private static parseNodeAttributeData(readData: any, nodeData: any): NeElementAttribute[] {
    const nodeAttributeData: NeElementAttribute[] = [];

    for (const entry of readData) {
      const obj: NeElementAttribute = {
        reference: String(entry.po),
        key: UtilityService.utilCleanString(entry.n),
        keyHR: entry.n,
        value: UtilityService.utilCleanString(entry.v),
        valueHR: entry.v,
        datatype: entry.d || null
      };
      nodeAttributeData.push(obj);
    }
    return nodeAttributeData;
  }

  /**
   * Method for parsing edge data. See {@link NeEdge|NeEdge} for further info on format
   * @param readData input data
   */
  private static parseEdgeData(readData: any): NeEdge[] {
    const edgeData: NeEdge[] = [];

    for (const entry of readData) {
      const obj: NeEdge = {
        id: 'e'.concat(String(entry['@id'])),
        group: 'edges',
        name: entry.i,
        source: String(entry.s),
        target: String(entry.t),
        classes: [],
        attributes: []
      };

      if (entry.i) {
        obj.attributes.push({
          reference: obj.id,
          key: 'interaction',
          keyHR: 'interaction',
          value: UtilityService.utilCleanString(entry.i),
          valueHR: entry.i,
          datatype: 'string'
        });
      }
      edgeData.push(obj);

    }
    return edgeData;
  }

  /**
   * Method for parsing edge attribute data. See {@link NeElementAttribute|NeElementAttribute} for further info on format
   * @param readData input data
   * @param edgeData raw edge data
   */
  private static parseEdgeAttributeData(readData: any, edgeData: any): NeElementAttribute[] {
    const edgeAttributeData: NeElementAttribute[] = [];

    for (const entry of readData) {
      const obj: NeElementAttribute = {
        reference: 'e'.concat(String(entry.po)),
        key: entry.n,
        keyHR: entry.n,
        value: entry.v,
        valueHR: entry.v,
        datatype: entry.d || null
      };
      edgeAttributeData.push(obj);
    }

    return edgeAttributeData;
  }

  /**
   * Method for parsing layout data. See {@link NePosition|NePosition} for further info on format
   * @param readData input data
   */
  private static parseLayoutData(readData: any): NePosition[] {
    const layoutData: NePosition[] = [];

    for (const entry of readData) {
      const obj: NePosition = {
        reference: String(entry.node),
        x: entry.x,
        y: entry.y
      };
      layoutData.push(obj);
    }
    return layoutData;
  }

  /**
   * @todo
   * Method for parsing network style data. See {@link NeStyleComponent|NeStyleComponent} for further info on format
   * @param readData input data
   */
  private static parseStyleNetwork(readData: any): NeStyleComponent[] {
    const styleNetwork: NeStyleComponent[] = [];
    return styleNetwork;
  }

  /**
   * Method to consolidate the styling of the graph
   * @param parsedStyles styles which need to be added to an existing selector within globalStyles
   * or for which a new selector has to be created
   * @param globalStyle target style which is used to render the graph
   */
  private static addStyles(parsedStyles: NeStyleComponent[], globalStyle: NeStyle[]): void {
    outerLoop: for (const ps of parsedStyles) {

      if (ps) {
        let found = false;
        for (const styleObj of globalStyle) {
          if (ps && styleObj.selector === ps.selector) {
            found = true;
            styleObj.style[ps.cssKey] = ps.cssValue;
            continue outerLoop;
          }
        }

        if (!found) {
          const tmp: NeStyle = {
            selector: ps.selector,
            style: {},
            appliedTo: [],
            priority: ps.priority
          };
          tmp.style[ps.cssKey] = ps.cssValue;
          globalStyle.push(tmp);
        }
      }
    }
  }

  /**
   * Method to fill up any string with leading zeros
   *
   * @param s input string
   * @param targetLength length to be filled up on
   */
  private static utilLeadingZeros(s: string, targetLength: number): string {
    while (s.length < targetLength) {
      s = '0'.concat(s);
    }
    return s;
  }

  private static orderStyles(parsedStyles: NeStyleComponent[]): NeStyleComponent[] {
    return parsedStyles.sort((a, b) => (a.priority < b.priority) ? -1 : 1);
  }

  // public static findPriorityBySelector(selector: string): number {
  //   let priority = -1;
  //
  //   if (selector === 'node' || selector === 'edge') {
  //     // selectors: default
  //     priority = 0;
  //   } else if (selector.startsWith('.') && selector.match(/[0-9]/g) === null) {
  //     // selectors: aspect specific
  //     priority = 1;
  //   } else if (selector.match(/[0-9]/g) !== null) {
  //     // selectors: element specific
  //     priority = 2;
  //   } else if (selector.includes(':')) {
  //     // selectors: special
  //     priority = 3;
  //   }
  //
  //   return priority;
  // }

  /**
   * Parses a file from .cx to cytoscape.js interpretable data
   *
   * @param filedata data of the .cx file
   */
  mockedFiles(filedata: any): NeNetwork {
    let networkAttributeData;
    let nodeData;
    let nodeAttributeData;
    let edgeData;
    let edgeAttributeData;
    let layoutData;

    let styleNetwork;
    let styleNodesDefault;
    const styleNodes = [];
    let styleEdgesDefault;
    const styleEdges = [];

    filedata.forEach(obj => {
      if (obj.networkAttributes) {
        networkAttributeData = obj.networkAttributes;
      }
      if (obj.nodes) {
        nodeData = obj.nodes;
      }
      if (obj.nodeAttributes) {
        nodeAttributeData = obj.nodeAttributes;
      }
      if (obj.edges) {
        edgeData = obj.edges;
      }
      if (obj.edgeAttributes) {
        edgeAttributeData = obj.edgeAttributes;
      }
      if (obj.cartesianLayout) {
        layoutData = obj.cartesianLayout;
      }
      if (obj.cyVisualProperties) {
        obj.cyVisualProperties.forEach(prop => {
          switch (prop.properties_of) {
            case 'network':
              styleNetwork = prop;
              break;
            case 'nodes:default':
              styleNodesDefault = prop;
              break;
            case 'nodes':
              styleNodes.push(prop);
              break;
            case 'edges:default':
              styleEdgesDefault = prop;
              break;
            case 'edges':
              styleEdges.push(prop);
              break;
          }
        });
      }
    });

    const networkAttributes = networkAttributeData;

    const networkInformation: NeNetworkInformation = {
      name: '',
      rightsholder: '',
      networkType: '',
      organism: '',
      description: '',
    };

    for (const na of networkAttributes) {
      switch (na.n) {
        case 'name':
          networkInformation.name = na.v;
          break;
        case 'rightsHolder':
          networkInformation.rightsholder = na.v;
          break;
        case 'networkType':
          networkInformation.networkType = na.v;
          break;
        case 'organism':
          networkInformation.organism = na.v;
          break;
        case 'description':
          networkInformation.description = na.v;
          break;
      }
    }

    const parsedNodeData = ParseService.parseNodeData(nodeData || []);
    const parsedNodeAttributeData = ParseService.parseNodeAttributeData(nodeAttributeData || [], nodeData || []);
    const parsedLayoutData = ParseService.parseLayoutData(layoutData || []);

    for (const node of parsedNodeData) {
      node.attributes = parsedNodeAttributeData.filter(x => x.reference === node.id);
      node.position = parsedLayoutData.find(x => x.reference === node.id);
    }

    const parsedEdgeData = ParseService.parseEdgeData(edgeData || []);
    const parsedEdgeAttributeData = ParseService.parseEdgeAttributeData(edgeAttributeData || [], edgeData || []);
    for (const edge of parsedEdgeData) {
      edge.attributes = edge.attributes.concat(parsedEdgeAttributeData.filter(x => x.reference === edge.id));
    }

    const parsedStyleNetwork = ParseService.parseStyleNetwork(styleNetwork || []); // todo
    const parsedStyleNodesDefault = this.parseStyleNodesDefault(styleNodesDefault || []);
    const parsedStyleNodes = this.parseStyleElements(styleNodes || [], 'node');
    const parsedStyleEdgesDefault = this.parseStyleEdgesDefault(styleEdgesDefault || []);
    const parsedStyleEdges = this.parseStyleElements(styleEdges || [], 'edge');

    const parsedMappingsNodesDefault = this.parseMappingsElementsDefault((styleNodesDefault || []),
      'node', parsedNodeData);

    const parsedMappingsEdgesDefault = this.parseMappingsElementsDefault((styleEdgesDefault || []),
      'edge', parsedEdgeData);

    const arrowColorAsEdgeColor: boolean = this.evalEdgeStyleDependencies(styleEdgesDefault || []);

    // adding discrete mappings to matching nodes
    if (parsedMappingsNodesDefault.discrete) {
      for (const node of parsedNodeData) {
        for (const nodeAttribute of node.attributes) {
          for (const nodeMapping of parsedMappingsNodesDefault.discrete) {
            const classSelector = nodeMapping.selector.substring(1);

            if (nodeAttribute.key === nodeMapping.col
              && nodeAttribute.value === nodeMapping.is
              && !node.classes.includes(classSelector)) {
              node.classes.push(classSelector);
            }
          }
        }
        for (const nodeStyle of parsedStyleNodes) {
          const id = nodeStyle.selector.substring(6);
          const classSelector = nodeStyle.selector.substring(1);
          if (node.id === id && !node.classes.includes(classSelector)) {
            node.classes.push(classSelector);
          }
        }
        node.classes.push('custom_highlight_color');
        node.classes.push('hide_label');
        node.classes.push('text-wrap');
      }
    }

    // adding discrete mappings to matching edges
    if (parsedMappingsEdgesDefault.discrete) {
      for (const edge of parsedEdgeData) {
        for (const edgeAttribute of edge.attributes) {
          for (const edgeMapping of parsedMappingsEdgesDefault.discrete) {
            const classSelector = edgeMapping.selector.substring(1);

            if (edgeAttribute.key === edgeMapping.col
              && edgeAttribute.value === edgeMapping.is
              && !edge.classes.includes(classSelector)) {
              edge.classes.push(classSelector);
            }
          }
        }

        for (const edgeStyle of parsedStyleEdges) {
          const id = edgeStyle.selector.substring(6);
          const classSelector = edgeStyle.selector.substring(1);
          if (edge.id === id && !edge.classes.includes(classSelector)) {
            edge.classes.push(classSelector);
          }
        }
        edge.classes.push('custom_highlight_color');
        edge.classes.push('hide_label');
        edge.classes.push('text-wrap');
      }
    }

    if (parsedMappingsEdgesDefault.continuous) {
      for (const edgeMapping of parsedMappingsEdgesDefault.continuous) {

        for (const value of edgeMapping.values) {

          const id: string = value.selector.substring(6);
          const classSelector = value.selector.substring(1);
          const edge: NeEdge = parsedEdgeData.find(x => String(x.id) === id);

          if (edge && !edge.classes.includes(classSelector)) {
            edge.classes.push(classSelector);
          }

        }
      }
    }

    if (parsedMappingsNodesDefault.continuous) {
      for (const nodeMapping of parsedMappingsNodesDefault.continuous) {
        for (const value of nodeMapping.values) {

          const id: string = value.selector.substring(6);
          const classSelector = value.selector.substring(1);
          const node: NeNode = parsedNodeData.find(x => String(x.id) === id);

          if (node && !node.classes.includes(classSelector)) {
            node.classes.push(classSelector);
          }

        }
      }
    }

    const parsedData = parsedNodeData.concat(parsedEdgeData);
    let parsedStyles = parsedStyleNetwork.concat(
      parsedStyleNodesDefault,
      parsedStyleEdgesDefault,
      parsedMappingsEdgesDefault.discrete,
      parsedMappingsNodesDefault.discrete,
      parsedStyleNodes,
      parsedStyleEdges
    );

    if (parsedMappingsEdgesDefault.continuous) {
      for (const edgeMapping of parsedMappingsEdgesDefault.continuous) {
        parsedStyles = parsedStyles.concat(edgeMapping.values);
      }
    }

    if (parsedMappingsNodesDefault.continuous) {
      for (const nodeMapping of parsedMappingsNodesDefault.continuous) {
        parsedStyles = parsedStyles.concat(nodeMapping.values);
      }
    }

    parsedStyles = this.addArrowColor(parsedStyles, arrowColorAsEdgeColor);
    parsedStyles = ParseService.orderStyles(parsedStyles);

    const globalStyle: NeStyle[] = [];
    const styleConstants: any = {};

    if (arrowColorAsEdgeColor) {
      styleConstants['arrow-as-edge'] = true;
    }

    ParseService.addStyles(parsedStyles, globalStyle);
    const cyParsedData: ElementDefinition[] = [];

    for (const pd of parsedData) {

      const joinedClasses = pd.classes.join(' ');
      const tmp: ElementDefinition = {
        data: pd,
        classes: joinedClasses,
        position: pd.position,
        group: pd.group as ElementGroup,
      };
      cyParsedData.push(tmp);
    }

    for (const s of globalStyle) {
      for (const pd of parsedData) {
        const className = s.selector.substring(1);
        if ((pd.classes.includes(className))
          || (pd.group === 'edges' && s.selector === 'edge')
          || (pd.group === 'nodes' && s.selector === 'node')) {
          s.appliedTo.push(pd);

        }
      }
    }

    globalStyle.push({
      selector: '.custom_highlight_color',
      style: {
        'background-color': '#0000ff',
        'line-color': '#0000ff',
        'target-arrow-color': '#0000ff',
        'source-arrow-color': '#0000ff'
      },
      priority: 4
    });

    globalStyle.push({
      selector: '.text-wrap',
      style: {
        'text-wrap': 'wrap',
      },
      priority: 4
    });

    globalStyle.push({
      selector: '.hide_label',
      style: {
        label: '',
      },
      priority: 4
    });

    const currentId = this.id;
    this.id++;

    const aspectKeyValuesNodes: NeAspect[] = [];
    const aspectKeyValuesEdges: NeAspect[] = [];

    for (const element of parsedData) {
      const elementType = element.group;

      for (const attribute of element.attributes) {

        const aspect: NeAspect = {
          name: attribute.keyHR,
          values: [],
          appliedTo: [],
          datatype: attribute.datatype,
          mapPointerD: [],
          mapPointerC: [],
          chartDiscreteDistribution: null,
          chartContinuousDistribution: null,
          min: null,
          max: null
        };

        if (elementType === 'nodes') {
          let found = false;

          for (const akv of aspectKeyValuesNodes) {
            if (akv.name === attribute.keyHR) {
              if (!akv.values.includes(attribute.valueHR)) {
                akv.values.push(attribute.valueHR);
              }
              akv.appliedTo.push(element);
              found = true;
            }
          }

          if (!found) {
            aspect.values.push(attribute.valueHR);
            aspect.appliedTo.push(element);
            aspectKeyValuesNodes.push(aspect);
          }
        } else {
          let found = false;

          for (const akv of aspectKeyValuesEdges) {
            if (akv.name === attribute.keyHR) {
              if (!akv.values.includes(attribute.valueHR)) {
                akv.values.push(attribute.valueHR);
              }
              akv.appliedTo.push(element);
              found = true;
            }
          }

          if (!found) {
            aspect.values.push(attribute.valueHR);
            aspect.appliedTo.push(element);
            aspectKeyValuesEdges.push(aspect);
          }
        }
      }
    }

    const groupedMappingsNodes: NeGroupedMappingsDiscrete[] = this.groupDiscreteMappings(parsedMappingsNodesDefault.discrete);
    const groupedMappingsEdges: NeGroupedMappingsDiscrete[] = this.groupDiscreteMappings(parsedMappingsEdgesDefault.discrete);


    for (const akv of aspectKeyValuesNodes) {

      let min: number = Number.MAX_SAFE_INTEGER;
      let max: number = Number.MIN_SAFE_INTEGER;

      for (const value of akv.values) {
        if (!isNaN(Number(value)) && Number(value) < min) {
          min = Number(value);
        }
        if (!isNaN(Number(value)) && Number(value) > max) {
          max = Number(value);
        }
      }

      if (!isNaN(Number(min)) && Number(min) < Number.MAX_SAFE_INTEGER) {
        akv.min = Number(min);
      }
      if (!isNaN(Number(max)) && Number(max) > Number.MIN_SAFE_INTEGER) {
        akv.max = Number(max);
      }

      for (const nodeMap of groupedMappingsNodes) {
        if (akv.name === nodeMap.classifier) {
          // akv is discrete
          akv.mapPointerD.push(groupedMappingsNodes.indexOf(nodeMap));

        }
      }

      for (const contNodeMap of parsedMappingsNodesDefault.continuous) {
        if (akv.name === contNodeMap.title[1]) {
          akv.mapPointerC.push(parsedMappingsNodesDefault.continuous.indexOf(contNodeMap));
        }
      }
    }

    for (const akv of aspectKeyValuesEdges) {

      let min: number = Number.MAX_SAFE_INTEGER;
      let max: number = Number.MIN_SAFE_INTEGER;

      for (const value of akv.values) {
        if (!isNaN(Number(value)) && Number(value) < min) {
          min = Number(value);
        }
        if (!isNaN(Number(value)) && Number(value) > max) {
          max = Number(value);
        }
      }

      if (!isNaN(Number(min)) && Number(min) < Number.MAX_SAFE_INTEGER) {
        akv.min = Number(min);
      }
      if (!isNaN(Number(max)) && Number(max) > Number.MIN_SAFE_INTEGER) {
        akv.max = Number(max);
      }

      for (const edgeMap of groupedMappingsEdges) {
        if (akv.name === edgeMap.classifier) {
          akv.mapPointerD.push(groupedMappingsEdges.indexOf(edgeMap));

        }
      }

      for (const contEdgeMap of parsedMappingsEdgesDefault.continuous) {
        if (akv.name === contEdgeMap.title[1]) {
          akv.mapPointerC.push(parsedMappingsEdgesDefault.continuous.indexOf(contEdgeMap));
        }
      }
    }

    for (const akv of aspectKeyValuesNodes) {
      akv.chartDiscreteDistribution = {
        chartData: [
          {data: []}
        ],
        chartLabels: []
      };

      akv.chartContinuousDistribution = {
        chartData: [{
          label: akv.name,
          data: [] // contains obj as such: {data: [{x: 0, y: <value>}, {...} ]}
        }]
      };

      for (const value of akv.values) {
        akv.chartDiscreteDistribution.chartLabels.push(value);
        akv.chartDiscreteDistribution.chartData[0].data.push(0);
        akv.chartDiscreteDistribution.chartData[0].label = akv.name;

        const index = akv.values.indexOf(value);
        akv.chartContinuousDistribution.chartData[0].data.push({
          x: index,
          y: value
        });

        for (const element of parsedData.filter(x => x.group === 'nodes')) {
          for (const attribute of element.attributes) {
            if (attribute.keyHR === akv.name && attribute.valueHR === value) {
              for (const label of akv.chartDiscreteDistribution.chartLabels) {
                akv.chartDiscreteDistribution.chartData[0].data[akv.chartDiscreteDistribution.chartLabels.indexOf(value)]++;
              }
            }
          }
        }
      }
    }

    for (const akv of aspectKeyValuesEdges) {
      akv.chartDiscreteDistribution = {
        chartData: [
          {data: [], label: akv.name}
        ],
        chartLabels: []
      };

      akv.chartContinuousDistribution = {
        chartData: [{
          label: akv.name,
          data: [] // contains obj as such: {data: [{x: 0, y: <value>}, {...} ]}
        }]
      };

      for (const value of akv.values) {
        akv.chartDiscreteDistribution.chartLabels.push(value);
        akv.chartDiscreteDistribution.chartData[0].data.push(0);
        akv.chartDiscreteDistribution.chartData[0].label = akv.name;

        const index = akv.values.indexOf(value);
        akv.chartContinuousDistribution.chartData[0].data.push({
          x: index,
          y: value
        });

        for (const element of parsedData.filter(x => x.group === 'edges')) {
          for (const attribute of element.attributes) {
            if (attribute.keyHR === akv.name && attribute.valueHR === value) {
              akv.chartDiscreteDistribution.chartData[0].data[akv.chartDiscreteDistribution.chartLabels.indexOf(value)]++;
            }
          }
        }
      }
    }

    return {
      id: currentId,
      networkInformation,
      elements: cyParsedData,
      style: globalStyle,
      nodeCount: parsedData.filter(x => x.group === 'nodes').length, // rework to access KPI by given properties
      edgeCount: parsedData.filter(x => x.group === 'edges').length, // rework to access KPI by given properties
      cssClassCount: globalStyle.length, // rework to access KPI by given properties
      aspectKeyValuesNodes, // submit these as possible mappings todo add interaction, if given
      aspectKeyValuesEdges,
      mappings: {
        nodesDiscrete: groupedMappingsNodes,
        edgesDiscrete: groupedMappingsEdges,
        nodesContinuous: parsedMappingsNodesDefault.continuous,
        edgesContinuous: parsedMappingsEdgesDefault.continuous
      },
      styleConstants
    };
  }

  /**
   * Method for parsing default nodes style data. See {@link NeStyleComponent|NeStyleComponent} for further info on format
   * @param readData input data
   */
  private parseStyleNodesDefault(readData: any): NeStyleComponent[] {
    let styleNodesDefault: NeStyleComponent[] = [];
    const properties: any[] = readData.properties;

    let useSize = false;
    let useWidth = false;
    let useHeight = false;

    if (properties) {

      for (const propKey of Object.keys(properties)) {
        if (propKey === 'NODE_SIZE' && properties[propKey] !== '35.0') {
          useSize = true;
        } else if (propKey === 'NODE_WIDTH' && properties[propKey] !== '75.0') {
          useWidth = true;
        } else if (propKey === 'NODE_HEIGHT' && properties[propKey] !== '35.0') {
          useHeight = true;
        }
      }

      for (const propKey of Object.keys(properties)) {

        if (!((propKey === 'NODE_SIZE' && !useSize)
          || (propKey === 'NODE_WIDTH' && !useWidth)
          || (propKey === 'NODE_HEIGHT' && !useHeight))) {

          if (propKey === 'NODE_SIZE') {
            const tmpWidth = {
              key: 'NODE_WIDTH',
              value: properties[propKey]
            };
            const tmpHeight = {
              key: 'NODE_HEIGHT',
              value: properties[propKey]
            };
            const lookupWidth = this.lookup(tmpWidth);
            const lookupHeight = this.lookup(tmpHeight);

            styleNodesDefault = styleNodesDefault.concat(lookupWidth);
            styleNodesDefault = styleNodesDefault.concat(lookupHeight);

          } else {

            const tmp = {
              key: propKey,
              value: properties[propKey]
            };

            const lookup = this.lookup(tmp);
            styleNodesDefault = styleNodesDefault.concat(lookup);
          }
        }

      }
    }
    const labelData: NeStyleComponent = {
      selector: 'node',
      cssKey: 'label',
      cssValue: 'data(name)',
      priority: 0
    };

    return styleNodesDefault.concat(labelData);
  }


  /**
   * Method for parsing default edge style data. See {@link NeStyleComponent|NeStyleComponent} for further info on format
   * @param readData input data
   */
  private parseStyleEdgesDefault(readData: any): NeStyleComponent[] {
    let styleEdgesDefault: NeStyleComponent[] = [];
    const properties: any[] = readData.properties;

    if (properties) {
      for (const propKey of Object.keys(properties)) {
        const tmp = {
          key: propKey,
          value: properties[propKey]
        };
        const lookup = this.lookup(tmp, 'edge');
        styleEdgesDefault = styleEdgesDefault.concat(lookup);
      }
    }
    return styleEdgesDefault;
  }

  /**
   * Method for parsing style data for specific elements. See {@link NeStyleComponent|NeStyleComponent} for further info on format
   * @param readData input data
   * @param elementType can either be 'node' for {@link NeNode|NeNode} or 'edge' for {@link NeEdge|NeEdge}
   */
  private parseStyleElements(readData: any[], elementType: string): NeStyleComponent[] {
    let style: NeStyleComponent[] = [];
    for (const entry of readData) {
      const properties: any[] = entry.properties;
      if (properties) {
        for (const propKey of Object.keys(properties)) {
          const tmp = {
            key: propKey,
            value: properties[propKey]
          };

          const lookup = this.lookup(tmp, '.'.concat(elementType.concat('_'.concat(entry.applies_to))));
          style = style.concat(lookup);

        }
      }
    }
    return style;
  }

  /**
   * Method for parsing mappings data for nodes or edges. See {@link NeMappingsDefinition|NeMappingsDefinition} for further info on format
   * @param readData input data
   * @param elementType can either reference {@link NeNode|nodes} or {@link NeEdge|edges}
   * @param data elements where these mappings are applied
   * @returns object containing discrete, continuous and passthrough mappings, if available.
   * See {@link NeGlobalMappings|NeGlobalMappings} for details on format
   */
  private parseMappingsElementsDefault(readData: any,
                                       elementType: string,
                                       data: NeElement[]): NeGlobalMappings {
    let mappingsElementsDefault: NeMappingsDefinition[] = [];
    let mappingsElementsSpecific: NeContinuousCollection[] = [];

    if (!readData.mappings) {
      return {
        discrete: [],
        continuous: []
      };
    }

    const mappings = readData.mappings;
    const mapKeys = Object.keys(mappings);

    for (const mapKey of mapKeys) {

      const currentEntry: NeMappings = {
        key: mapKey,
        definition: readData.mappings[mapKey].definition,
        type: readData.mappings[mapKey].type
      };

      switch (currentEntry.type) {
        case 'DISCRETE':
          mappingsElementsDefault = mappingsElementsDefault.concat(this.parseMappingDiscrete(currentEntry, elementType));
          break;
        case 'PASSTHROUGH':
          // todo
          break;
        case 'CONTINUOUS':
          const continuous = this.parseMappingContinuous(currentEntry, elementType, data);
          mappingsElementsSpecific = mappingsElementsSpecific.concat(continuous);

          break;
      }
    }

    return {
      discrete: mappingsElementsDefault,
      continuous: mappingsElementsSpecific
    };
  }

  /**
   * Method for matching NDEx properties to cytoscape properties and vice versa
   *
   * @param property Object containing cssKey and cssValue to be parsed
   * @param selector name by which this style is recognised within CSS
   * @param from origin format
   * @param to target format
   * @returns array of {@link NeStyleComponent|NeStyleComponent}
   */
  private lookup(property: any, selector: string = 'node', from: string = 'ndex', to: string = 'cytoscape'): NeStyleComponent[] {

    let lookupMap: NeConversionMap;

    for (const entry of this.lookupData) {
      if (entry[from].includes(property.key)) {
        lookupMap = entry;
        break;
      }
    }

    let styleCollection: NeStyleComponent[];

    let builtSelector = selector;
    if (selector !== 'node' && selector !== 'edge' && lookupMap && lookupMap.selector) {
      builtSelector = selector.concat(lookupMap.selector);
    } else if (lookupMap && lookupMap.selector) {
      builtSelector = lookupMap.selector;
    }

    const priority = UtilityService.utilfindPriorityBySelector(builtSelector);

    // case 1: simply applicable
    if (lookupMap && !lookupMap.conversionType && lookupMap[to].length === 1) {
      return [{
        selector: builtSelector,
        cssKey: lookupMap[to][0],
        cssValue: property.value,
        priority
      }];
    } else if (lookupMap && lookupMap.conversionType) {
      switch (lookupMap.conversionType) {

        // case 2: conversion by method
        case 'method':

          const cssKey = lookupMap[to];
          let cssValue = property.value;
          styleCollection = [];

          for (const conv of lookupMap.conversion as any) {
            switch (conv[to]) {
              case 'low':
                cssValue = cssValue.toLowerCase();
                break;
              case 'up':
                cssValue = cssValue.toUpperCase();
                break;
              case '_':
                cssValue = cssValue.replace('-', '_');
                break;
              case '-':
                cssValue = cssValue.replace('_', '-');
                break;
              case 'norm255to1':
                cssValue /= 255;
                break;
              case 'norm1to255':
                cssValue *= 255;
                break;
            }
          }

          for (const key of lookupMap[to]) {
            const obj: NeStyleComponent = {
              selector: builtSelector,
              cssKey: key,
              cssValue,
              priority
            };

            if (!styleCollection.includes(obj)) {
              styleCollection.push(obj);
            }
          }

          return styleCollection;

        // case 3: conversion by split
        case 'split':
          const splitted = property.value.split(lookupMap.splitRules.splitAt);
          styleCollection = [];
          for (const index of lookupMap.splitRules.evalIndex) {
            const initialValue = splitted[index];
            const matchedValue: string[] = lookupMap.matchRules[initialValue];

            for (const key of lookupMap[to]) {

              const indexOfKey = lookupMap[to].indexOf(key);
              if (!matchedValue) {
                continue;
              }

              const obj: NeStyleComponent = {
                selector: builtSelector,
                cssKey: key,
                cssValue: matchedValue[indexOfKey],
                priority
              };
              styleCollection.push(obj);
            }
          }
          return styleCollection;
      }
    }
    return [];
  }

  private lookupKey(keys: string[], from: string = 'ndex', to: string = 'cytoscape'): string[] {

    let mappedKeys: string[] = [];

    for (const key of keys) {
      for (const entry of this.lookupData) {
        if (entry[from].includes(key)) {
          mappedKeys = mappedKeys.concat(entry[to]);
        }
      }
    }
    return mappedKeys;
  }

  private parseMappingDiscrete(mapping: NeMappings, elementType: string): NeMappingsDefinition[] {
    const mappingsElementsDefault: NeMappingsDefinition[] = [];

    const tmpObj: NeMappingsDefinition = {
      col: null,
      colHR: null,
      is: null,
      isHR: null,
      selector: null,
      cssKey: null,
      cssValue: null,
      priority: -1,
      datatype: null,
    };

    const tmpCollection: NeMappingsCollection = {
      cssKey: null,
      tmpK: [],
      tmpV: []
    };

    const lookupProperty = {
      key: mapping.key,
      value: null,
    };

    const definition = mapping.definition.replace(/,,/g, '%');
    const commaSplit = definition.split(',');
    let originalCol;

    for (const cs of commaSplit) {

      const equalSplit = cs.split('=');
      switch (equalSplit[0]) {
        case 'COL':
          tmpObj.col = UtilityService.utilCleanString(equalSplit[1]);
          originalCol = equalSplit[1];
          break;
        case 'T':
          tmpObj.datatype = equalSplit[1];
          break;
        case 'K':
          tmpCollection.tmpK.splice(Number(equalSplit[1]), 0, equalSplit[2]);
          break;
        case 'V':
          tmpCollection.tmpV.splice(Number(equalSplit[1]), 0, equalSplit[2]);
          break;
      }
    }

    for (const k of tmpCollection.tmpK) {
      lookupProperty.value = tmpCollection.tmpV[tmpCollection.tmpK.indexOf(k)];
      tmpObj.is = UtilityService.utilCleanString(k);

      if (tmpObj.col === 'sharedinteraction') {
        tmpObj.col = 'interaction';
        originalCol = 'interaction';
      }

      const tmpSelector = '.'.concat(elementType.concat('_'.concat(tmpObj.col.concat('_'.concat(tmpObj.is)))));
      const priority = UtilityService.utilfindPriorityBySelector(tmpSelector);
      tmpObj.selector = tmpSelector;

      let lookup: NeStyleComponent[] = [];

      if (lookupProperty.key === 'NODE_SIZE') {
        const lookupWidth = this.lookup({
          key: 'NODE_WIDTH',
          value: lookupProperty.value
        }, tmpSelector);
        const lookupHeight = this.lookup({
          key: 'NODE_HEIGHT',
          value: lookupProperty.value
        }, tmpSelector);

        for (const lw of lookupWidth) {
          lookup.push(lw);
        }
        for (const lh of lookupHeight) {
          lookup.push(lh);
        }
      } else if (lookupProperty.key === 'NODE_LABEL_POSITION') {
        const tmpProperty = {
          key: lookupProperty.key,
          value: lookupProperty.value.replace(/%/g, ',')
        };
        lookup = this.lookup(tmpProperty, tmpSelector);
      } else {
        lookup = this.lookup(lookupProperty, tmpSelector);
      }
      for (const lookupStyle of lookup) {

        tmpObj.cssKey = lookupStyle.cssKey;
        tmpObj.cssValue = lookupStyle.cssValue;

        if (lookupStyle.selector === tmpObj.selector && !mappingsElementsDefault.includes(tmpObj)) {

          const element: NeMappingsDefinition = {
            selector: tmpObj.selector,
            cssValue: tmpObj.cssValue,
            cssKey: tmpObj.cssKey,
            is: tmpObj.is,
            isHR: k,
            col: tmpObj.col,
            colHR: originalCol,
            priority,
            datatype: tmpObj.datatype
          };

          mappingsElementsDefault.push(element);
        }
      }
    }
    return mappingsElementsDefault;
  }

  private parseMappingContinuous(mapping: NeMappings,
                                 elementType: string,
                                 data: NeElement[]): NeContinuousCollection {

    const lookup: string[] = this.lookupKey([mapping.key]);
    const commaSplit = mapping.definition.split(',');

    const continuousCollection: NeContinuousCollection = {
      chart: null,
      values: [],
      displayChart: true,
      colorGradient: [],
      title: [],
    };

    let datatype;
    let attribute;
    let displayChart = true;
    const thresholds = [];
    const lowers = [];
    const equals = [];
    const greaters = [];


    for (const cs of commaSplit) {

      const equalSplit = cs.split('=');
      switch (equalSplit[0]) {
        case 'COL':
          attribute = equalSplit[1];
          break;
        case 'T':
          datatype = equalSplit[1];
          break;
        case 'L':
          lowers.splice(Number(equalSplit[1]), 0, equalSplit[2]);
          break;
        case 'E':
          equals.splice(Number(equalSplit[1]), 0, equalSplit[2]);
          break;
        case 'G':
          greaters.splice(Number(equalSplit[1]), 0, equalSplit[2]);
          break;
        case 'OV':
          thresholds.splice(Number(equalSplit[1]), 0, equalSplit[2]);
          break;
      }
    }

    for (let th of thresholds) {
      if (th.includes('E')) {
        const eSplit = th.split('E');
        th = eSplit[0] * Math.pow(10, Number(eSplit[1]));
      }
    }

    const buildClasses: NeStyleComponent[] = [];

    outer: for (const element of data) {

      for (const elementAttribute of element.attributes) {

        if (elementAttribute.key === attribute) {

          let intervalPointer = -1;

          const finalSelector = '.'.concat(elementType.concat('_'.concat(element.id)));
          const priority = UtilityService.utilfindPriorityBySelector(finalSelector);

          for (let i = 0; i < (thresholds.length); i++) {

            if (Number(elementAttribute.value) < Number(thresholds[i])) {

              intervalPointer = i;
              let cssValue = '';

              if (intervalPointer === 0) {
                cssValue = lowers[intervalPointer];
                if (cssValue.startsWith('#') && displayChart) {
                  displayChart = false;
                }
              } else {
                const calculationMap: NeContinuousMap = {
                  inputValue: elementAttribute.value,
                  lower: greaters[intervalPointer - 1],
                  lowerThreshold: thresholds[intervalPointer - 1],
                  greater: lowers[intervalPointer],
                  greaterThreshold: thresholds[intervalPointer],
                };
                cssValue = this.calculateRelativeValue(calculationMap);
                if (cssValue.startsWith('#') && displayChart) {
                  displayChart = false;

                }
              }

              for (const lu of lookup) {

                buildClasses.push({
                  selector: finalSelector,
                  cssKey: lu,
                  cssValue,
                  priority
                });

              }
              continue outer;
            } else if (Number(elementAttribute.value) === Number(thresholds[i])) {

              for (const lu of lookup) {
                buildClasses.push({
                  selector: finalSelector,
                  cssKey: lu,
                  cssValue: equals[i],
                  priority
                });
                if (equals[i].startsWith('#') && displayChart) {
                  displayChart = false;

                }

              }
              continue outer;
            }
          }

          for (const lu of lookup) {
            buildClasses.push({
              selector: '.'.concat(elementType.concat('_'.concat(element.id))),
              cssKey: lu,
              cssValue: greaters[greaters.length - 1],
              priority
            });
            if (greaters[greaters.length - 1].startsWith('#') && displayChart) {
              displayChart = false;

            }
          }
          continue outer;
        }
      }
    }

    const gradientObject = this.buildColorGradient(thresholds, lowers, equals, greaters, lookup, attribute);
    const chartObject = this.buildChartData(thresholds, lowers, equals, greaters, lookup, attribute);

    continuousCollection.values = buildClasses;
    continuousCollection.chart = chartObject;
    continuousCollection.colorGradient = gradientObject;
    continuousCollection.chartValid = (displayChart && (chartObject !== null));
    continuousCollection.gradientValid = (!displayChart && (gradientObject.length > 0));
    continuousCollection.displayChart = displayChart;
    continuousCollection.title = [lookup, attribute];
    return continuousCollection;
  }

  private buildColorGradient(thresholds: string[],
                             lowers: string[],
                             equals: string[],
                             greaters: string[],
                             lookup: string[],
                             attribute: string): NeColorGradient[] {
    if (!lowers[0].startsWith('#')) {
      return [];
    }
    const colorGradientCollection: NeColorGradient[] = [];
    const range: number = Number(thresholds[thresholds.length - 1]) - Number(thresholds[0]);
    if (range === 0) {
      return [];
    }
    colorGradientCollection.push({
      color: lowers[0],
      offset: '-1',
      numericThreshold: '-1',
      title: lookup.concat([attribute])
    });
    for (const th of thresholds) {
      const offset = ((Number(th) - Number(thresholds[0])) * 100 / range).toFixed(0);
      const gradient: NeColorGradient = {
        color: equals[thresholds.indexOf(th)],
        offset: String(offset).concat('%'),
        numericThreshold: th,
        title: lookup.concat([attribute])
      };
      colorGradientCollection.push(gradient);
    }
    colorGradientCollection.push({
      color: greaters[greaters.length - 1],
      offset: '101',
      numericThreshold: '101',
      title: lookup.concat([attribute])
    });
    return colorGradientCollection;
  }

  private buildChartData(
    thresholds: string[],
    lowers: string[],
    equals: string[],
    greaters: string[],
    lookup: string[],
    attribute: any): any {

    const chartMappingObject: any = {
      lineChartData: [],
      lineChartLabels: [],
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
          text: [attribute, lookup]
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

    chartMappingObject.lineChartLabels.push('');

    for (const th of thresholds) {
      chartMappingObject.lineChartLabels.push(th);
    }

    chartMappingObject.lineChartLabels.push('');

    for (const lu of lookup) {
      const tmp = {
        label: lu,
        data: equals
      };
      if (!chartMappingObject.lineChartData.includes(tmp)) {
        chartMappingObject.lineChartData.push(tmp);
      }
    }

    chartMappingObject.lineChartData[0].data.splice(0, 0, lowers[0]);
    chartMappingObject.lineChartData[0].data.push(greaters[greaters.length - 1]);

    return chartMappingObject;
  }

  private calculateRelativeValue(inputMap: NeContinuousMap): string {

    let returnValue;
    const xDiff = Number(inputMap.greaterThreshold) - Number(inputMap.lowerThreshold);
    const xDiffRequired = Number(inputMap.inputValue) - Number(inputMap.lowerThreshold);

    if (inputMap.lower.includes('#')) {
      // workaround for hex value comparison
      const hexGreater = inputMap.greater.replace('#', '');
      const hexLower = inputMap.lower.replace('#', '');

      const hexGreaterMap = {
        r: Number('0x'.concat(hexGreater.substring(0, 2))),
        g: Number('0x'.concat(hexGreater.substring(2, 4))),
        b: Number('0x'.concat(hexGreater.substring(4, 6))),
      };

      const hexLowerMap = {
        r: Number('0x'.concat(hexLower.substring(0, 2))),
        g: Number('0x'.concat(hexLower.substring(2, 4))),
        b: Number('0x'.concat(hexLower.substring(4, 6))),
      };

      const yDiffMap = {
        r: hexGreaterMap.r - hexLowerMap.r,
        g: hexGreaterMap.g - hexLowerMap.g,
        b: hexGreaterMap.b - hexLowerMap.b
      };

      const slopeCoefficientMap = {
        r: yDiffMap.r / xDiff,
        g: yDiffMap.g / xDiff,
        b: yDiffMap.b / xDiff
      };

      const resultMap = {
        // tslint:disable-next-line:no-bitwise
        r: ((xDiffRequired * slopeCoefficientMap.r) + hexLowerMap.r) & 0xff,
        // tslint:disable-next-line:no-bitwise
        g: ((xDiffRequired * slopeCoefficientMap.g) + hexLowerMap.g) & 0xff,
        // tslint:disable-next-line:no-bitwise
        b: ((xDiffRequired * slopeCoefficientMap.b) + hexLowerMap.b) & 0xff
      };

      const resultR = ParseService.utilLeadingZeros(resultMap.r.toString(16), 2);
      const resultG = ParseService.utilLeadingZeros(resultMap.g.toString(16), 2);
      const resultB = ParseService.utilLeadingZeros(resultMap.b.toString(16), 2);

      returnValue = '#'.concat(resultR.concat(resultG.concat(resultB)));

    } else {

      const yDiff = Number(inputMap.greater) - Number(inputMap.lower);
      const slopeCoefficient = yDiff / xDiff;

      returnValue = String(((xDiffRequired * slopeCoefficient) + Number(inputMap.lower)).toPrecision(5));
    }

    return returnValue;
  }


  private groupDiscreteMappings(mappings: NeMappingsDefinition[]): NeGroupedMappingsDiscrete[] {

    const groupedMappings: NeGroupedMappingsDiscrete[] = [];

    if (!mappings) {
      return groupedMappings;
    }

    outer: for (const map of mappings) {
      for (const gm of groupedMappings) {
        if (gm.classifier === map.colHR) {
          continue outer;
        }
      }
      groupedMappings.push({
        classifier: map.colHR,
        values: [],
        styleMap: [],
        th: [],
        selectors: []
      });
    }

    for (const map of mappings) {
      for (const gm of groupedMappings) {

        if (gm.classifier === map.colHR) {
          let found = false;
          for (const style of gm.styleMap) {
            if (style.cssKey === map.cssKey) {
              found = true;
              if (!style.selectors.includes(map.selector)) {
                style.cssValues.push(map.cssValue);
                style.selectors.push(map.selector);
                if (!gm.selectors.includes(map.selector)) {
                  gm.selectors.push(map.selector);
                }
              }
            }
          }

          if (!found) {
            gm.th.push(map.cssKey);

            if (!gm.selectors.includes(map.selector)) {
              gm.selectors.push(map.selector);
            }
            gm.styleMap.push({
              cssKey: map.cssKey,
              cssValues: [map.cssValue],
              selectors: [map.selector]
            });
          }

          if (!gm.values.includes(map.isHR)) {
            gm.values.push(map.isHR);
          }
        }
      }
    }

    return groupedMappings;
  }

  private evalEdgeStyleDependencies(styleEdgesDefault: any): boolean {
    if (styleEdgesDefault.dependencies) {
      return styleEdgesDefault.dependencies.arrowColorMatchesEdge || false;
    }
  }

  private addArrowColor(parsedStyles: NeStyleComponent[], arrowColorAsEdgeColor: boolean): NeStyleComponent[] {
    for (const style of parsedStyles) {
      if (style && style.cssKey === 'line-color' && arrowColorAsEdgeColor) {
        const objTarget: NeStyleComponent = {
          selector: style.selector,
          cssKey: 'target-arrow-color',
          cssValue: style.cssValue,
          priority: style.priority
        };
        parsedStyles.push(objTarget);
        const objSource: NeStyleComponent = {
          selector: style.selector,
          cssKey: 'source-arrow-color',
          cssValue: style.cssValue,
          priority: style.priority
        };
        parsedStyles.push(objSource);
      } else if (style && style.cssKey === 'line-color') {
        const objTarget: NeStyleComponent = {
          selector: style.selector,
          cssKey: 'target-arrow-color',
          cssValue: '#000000',
          priority: style.priority
        };
        parsedStyles.push(objTarget);
        const objSource: NeStyleComponent = {
          selector: style.selector,
          cssKey: 'source-arrow-color',
          cssValue: '#000000',
          priority: style.priority
        };
        parsedStyles.push(objSource);
      }
    }
    return parsedStyles;
  }
}
