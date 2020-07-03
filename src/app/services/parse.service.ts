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

  private id = 0;
  readonly lookupFilePath = 'assets/';
  readonly lookupFileName = 'lookup.json';
  lookupData: NeConversionMap[];

  /**
   * Utility method for removing any whitespace and round brackets from a string; also casts to lower case
   *
   * @param input string to be cleaned
   * @returns cleaned string
   */
  private static utilCleanString(input: string): string {
    if (!input) {
      return '';
    }
    input = String(input);
    return input.replace(/\s*\(*\)*/g, '').toLowerCase();
  }

  /**
   * Method for parsing node data. See {@link NeNode|NeNode} for further info on format
   * @param readData input data
   */
  private static parseNodeData(readData: any): NeNode[] {
    const nodeData: NeNode[] = [];

    for (const entry of readData) {
      const obj: NeNode = {
        id: entry['@id'],
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
   */
  private static parseNodeAttributeData(readData: any): NeElementAttribute[] {
    const nodeAttributeData: NeElementAttribute[] = [];

    for (const entry of readData) {
      const obj: NeElementAttribute = {
        reference: entry.po,
        key: ParseService.utilCleanString(entry.n),
        value: ParseService.utilCleanString(entry.v),
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
        id: entry['@id'],
        group: 'edges',
        name: entry.i,
        source: entry.s,
        target: entry.t,
        classes: []
      };
      edgeData.push(obj);
    }
    return edgeData;
  }

  /**
   * Method for parsing edge attribute data. See {@link NeElementAttribute|NeElementAttribute} for further info on format
   * @param readData input data
   */
  private static parseEdgeAttributeData(readData: any): NeElementAttribute[] {
    const edgeAttributeData: NeElementAttribute[] = [];

    for (const entry of readData) {
      const obj: NeElementAttribute = {
        reference: entry.po,
        key: entry.n,
        value: entry.v,
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
        reference: entry.node,
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
      let found = false;

      for (const styleObj of globalStyle) {
        if (styleObj.selector === ps.selector) {
          found = true;
          styleObj.style[ps.cssKey] = ps.cssValue;
          continue outerLoop;
        }
      }

      if (!found) {
        const tmp: NeStyle = {
          selector: ps.selector,
          style: {},
          appliedTo: []
        };
        tmp.style[ps.cssKey] = ps.cssValue;
        globalStyle.push(tmp);
      }
    }
  }

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

    const networkAttributes = networkAttributeData; // not sure if there is a format to be formed into a consistent model

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
    const parsedNodeAttributeData = ParseService.parseNodeAttributeData(nodeAttributeData || []);
    const parsedLayoutData = ParseService.parseLayoutData(layoutData || []);

    for (const node of parsedNodeData) {
      node.attributes = parsedNodeAttributeData.filter(x => x.reference === node.id);
      node.position = parsedLayoutData.find(x => x.reference === node.id);
    }

    const parsedEdgeData = ParseService.parseEdgeData(edgeData || []);
    const parsedEdgeAttributeData = ParseService.parseEdgeAttributeData(edgeAttributeData || []);

    for (const edge of parsedEdgeData) {
      edge.attributes = parsedEdgeAttributeData.filter(x => x.reference === edge.id);
    }

    const parsedStyleNetwork = ParseService.parseStyleNetwork(styleNetwork || []); // todo
    const parsedStyleNodesDefault = this.parseStyleNodesDefault(styleNodesDefault || []);
    const parsedStyleNodes = this.parseStyleElements(styleNodes || [], 'node');
    const parsedStyleEdgesDefault = this.parseStyleEdgesDefault(styleEdgesDefault || []);
    const parsedStyleEdges = this.parseStyleElements(styleEdges || [], 'edge');

    const parsedMappingsNodesDefault = this.parseMappingsElementsDefault((styleNodesDefault || []), 'node');
    const parsedMappingsEdgesDefault = this.parseMappingsElementsDefault((styleEdgesDefault || []), 'edge'); // todo

    for (const node of parsedNodeData) {
      for (const nodeAttribute of node.attributes) {
        for (const nodeMapping of parsedMappingsNodesDefault) {
          const classSelector = nodeMapping.selector.substring(1);
          if (nodeAttribute.key === nodeMapping.col
            && nodeAttribute.value === nodeMapping.is
            && !node.classes.includes(classSelector)) {
            node.classes.push(classSelector);
          }
        }
      }
    }

    for (const edge of parsedEdgeData) {
      for (const edgeAttribute of edge.attributes) {
        for (const edgeMapping of parsedMappingsEdgesDefault) {
          const classSelector = edgeMapping.selector.substring(1);
          if (edgeAttribute.key === edgeMapping.col
            && edgeAttribute.value === edgeMapping.is
            && !edge.classes.includes(classSelector)) {
            edge.classes.push(classSelector);
          }
        }
      }
    }

    const parsedData = parsedNodeData.concat(parsedEdgeData);
    const parsedStyles = parsedStyleNetwork.concat(
      parsedStyleNodes,
      parsedStyleNodesDefault,
      parsedStyleEdgesDefault,
      parsedStyleEdges);

    const globalStyle: NeStyle[] = [];

    ParseService.addStyles(parsedStyles, globalStyle);
    ParseService.addStyles(parsedMappingsNodesDefault, globalStyle);

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

    const currentId = this.id;
    this.id++;

    return {
      id: currentId,
      networkInformation,
      elements: cyParsedData,
      style: globalStyle,
      nodeCount: parsedData.filter(x => x.group === 'nodes').length,
      edgeCount: parsedData.filter(x => x.group === 'edges').length,
      cssClassCount: globalStyle.length,
    };
  }


  /**
   * Method for parsing default nodes style data. See {@link NeStyleComponent|NeStyleComponent} for further info on format
   * @param readData input data
   */
  private parseStyleNodesDefault(readData: any): NeStyleComponent[] {
    let styleNodesDefault: NeStyleComponent[] = [];
    const properties: any[] = readData.properties;

    if (properties) {
      for (const propKey of Object.keys(properties)) {
        const tmp = {
          key: propKey,
          value: properties[propKey]
        };
        const lookup = this.lookup(tmp);
        styleNodesDefault = styleNodesDefault.concat(lookup);
      }
    }
    return styleNodesDefault;
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
          const lookup = this.lookup(tmp, '.'.concat(elementType.concat(entry.applies_to)));
          style = style.concat(lookup);
        }
      }
    }
    return style;
  }

  /**
   * @todo
   * Method for parsing mappings data for nodes or edges. See {@link NeMappingsDefinition|NeMappingsDefinition} for further info on format
   * @param readData input data
   * @param elementType can either reference {@link NeNode|nodes} or {@link NeEdge|edges}
   */
  private parseMappingsElementsDefault(readData: any, elementType: string): NeMappingsDefinition[] {
    const mappingsElementsDefault: NeMappingsDefinition[] = [];

    if (!readData.mappings) {
      return mappingsElementsDefault;
    }

    const mappings = readData.mappings;
    const mapKeys = Object.keys(mappings);

    for (const mapKey of mapKeys) {

      const tmpObj: NeMappingsDefinition = {
        col: null,
        is: null,
        selector: null,
        cssKey: null,
        cssValue: null,
      };


      const tmpCollection: NeMappingsCollection = {
        cssKey: null,
        tmpK: [],
        tmpV: []
      };

      const lookupProperty = {
        key: mapKey,
        value: null,
      };

      const currentEntry: NeMappings = readData.mappings[mapKey];

      let definition = currentEntry.definition;
      const mappingType = currentEntry.type;
      definition = definition.replace(/,,/g, '%');

      const commaSplit = definition.split(',');

      if (mappingType === 'PASSTHROUGH') {
        console.log(mapKey, currentEntry);
      }

      // todo distinct CONTINUOUS, PASSTHROUGH and DISCRETE type

      for (const cs of commaSplit) {

        const equalSplit = cs.split('=');
        switch (equalSplit[0]) {
          case 'COL':
            tmpObj.col = ParseService.utilCleanString(equalSplit[1]);
            break;
          case 'T':
            break;
          case 'K':
            tmpCollection.tmpK.splice(Number(equalSplit[1]), 0, ParseService.utilCleanString(equalSplit[2]));
            break;
          case 'V':
            tmpCollection.tmpV.splice(Number(equalSplit[1]), 0, ParseService.utilCleanString(equalSplit[2]));
            break;
        }
      }

      for (const k of tmpCollection.tmpK) {
        lookupProperty.value = tmpCollection.tmpV[tmpCollection.tmpK.indexOf(k)];
        tmpObj.is = ParseService.utilCleanString(k);

        const tmpSelector = '.'.concat(elementType.concat('_'.concat(tmpObj.col.concat('_'.concat(tmpObj.is)))));
        tmpObj.selector = tmpSelector;

        const lookup = this.lookup(lookupProperty, tmpSelector);

        for (const lookupStyle of lookup) {

          tmpObj.cssKey = lookupStyle.cssKey;
          tmpObj.cssValue = lookupStyle.cssValue;

          if (lookupStyle.selector === tmpObj.selector && !mappingsElementsDefault.includes(tmpObj)) {

            const element: NeMappingsDefinition = {
              selector: tmpObj.selector,
              cssValue: tmpObj.cssValue,
              cssKey: tmpObj.cssKey,
              is: tmpObj.is,
              col: tmpObj.col
            };

            mappingsElementsDefault.push(element);
            break;
          }
        }
      }
    }
    return mappingsElementsDefault;
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

    // case 1: simply applicable
    if (lookupMap && !lookupMap.conversion && lookupMap[to].length === 1) {
      return [{
        selector: lookupMap[selector] || selector,
        cssKey: lookupMap[to][0],
        cssValue: property.value
      }];
    } else if (lookupMap && lookupMap.conversion) {
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
              selector: lookupMap.selector || selector,
              cssKey: key,
              cssValue,
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
            const matchedValue: string[] = lookupMap.rules[initialValue];

            for (const key of lookupMap[to]) {

              const indexOfKey = lookupMap[to].indexOf(key);
              if (!matchedValue) {
                continue;
              }

              const obj: NeStyleComponent = {
                selector: lookupMap.selector || selector,
                cssKey: key,
                cssValue: matchedValue[indexOfKey],
              };
              styleCollection.push(obj);
            }
          }
          return styleCollection;
      }
    }
    return [];
  }
}
