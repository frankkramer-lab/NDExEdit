import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as cytoscape from 'cytoscape';
import {NeStyle} from '../models/ne-style';
import {NeNetworkInformation} from '../models/ne-network-information';
import {NeNetwork} from '../models/ne-network';
import {NeColorGradient} from '../models/ne-color-gradient';
import {UtilityService} from './utility.service';
import {NeChart} from '../models/ne-chart';
import {ChartDataSets} from 'chart.js';

import 'cytoscape-cx2js';
import {CxToJs, CyNetworkUtils} from 'cytoscape-cx2js';
import {DataService} from './data.service';
import {NeMappingsMap} from '../models/ne-mappings-map';
import {NeMappingDiscrete} from '../models/ne-mapping-discrete';
import {NeMappingContinuous} from '../models/ne-mapping-continuous';
import {NeGroupedMappingsDiscrete} from '../models/ne-grouped-mappings-discrete';
import {NeStyleMap} from '../models/ne-style-map';

@Injectable({
  providedIn: 'root'
})

/**
 * Service for parsing of .cx and cytoscape files
 */
export class ParseService {

  constructor(
    private http: HttpClient,
    private utilityService: UtilityService,
    private dataService: DataService) {
  }

  /**
   * Creates a discrete mapping object based on the definition string.
   * Keys and values are always considered to be strings
   *
   * @param obj Contains type and definition
   * @param styleProperty Name of the style property
   * @private
   */
  private static parseDefinitionDiscrete(obj: any, styleProperty: string): NeMappingDiscrete {

    if (!obj || !obj.definition || !styleProperty) {
      console.log('No definition given');
      return null;
    }

    const discreteMapping: NeMappingDiscrete = {
      col: null,
      type: obj.type,
      styleProperty,
      keys: null,
      values: null
    };

    const commaSplit = obj.definition.split(',');
    const tmpV = [];
    const tmpK = [];

    for (const cs of commaSplit) {

      const equalSplit = cs.split('=');
      switch (equalSplit[0]) {
        case 'COL':
          discreteMapping.col = equalSplit[1];
          break;
        case 'T':
          discreteMapping.type = equalSplit[1];
          break;
        case 'K':
          tmpK.splice(equalSplit[1], 0, equalSplit[2]);
          break;
        case 'V':
          tmpV.splice(equalSplit[1], 0, equalSplit[2]);
          break;
      }
    }
    discreteMapping.keys = tmpK;
    discreteMapping.values = tmpV;
    return discreteMapping;
  }

  /**
   * Builds the color gradient for a continuous mapping with color application
   * @param mapping Mapping to be interpreted as color mapping
   * @private
   */
  private static buildColorGradient(mapping: NeMappingContinuous): NeColorGradient[] {
    const thresholds = mapping.thresholds as string[];
    const lowers = mapping.lowers as string[];
    const greaters = mapping.greaters as string[];
    const equals = mapping.equals as string[];

    const colorGradientCollection: NeColorGradient[] = [];
    const range: number = Number(thresholds[thresholds.length - 1]) - Number(thresholds[0]);
    if (range === 0) {
      return [];
    }
    colorGradientCollection.push({
      color: lowers[0],
      offset: '-1',
      numericThreshold: '-1',
      // title: lookup.concat([attribute])
      title: []
    });
    for (const th of thresholds) {
      const offset = ((Number(th) - Number(thresholds[0])) * 100 / range).toFixed(0);
      const gradient: NeColorGradient = {
        color: equals[thresholds.indexOf(th)],
        offset: String(offset).concat('%'),
        numericThreshold: th,
        // title: lookup.concat([attribute])
        title: []
      };
      colorGradientCollection.push(gradient);
    }
    colorGradientCollection.push({
      color: greaters[greaters.length - 1],
      offset: '101',
      numericThreshold: '101',
      // title: lookup.concat([attribute])
      title: []
    });
    return colorGradientCollection;
  }


  private buildChartData(mapping: NeMappingContinuous): NeChart {

    const chartMappingObject: NeChart = {
      chartData: [],
      chartType: {
        bar: false,
        line: true
      },
      chartLabels: [],
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
          text: ['test1', 'test2'] // todo rework for legend
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

    chartMappingObject.chartLabels.push('');

    for (const th of mapping.thresholds) {
      chartMappingObject.chartLabels.push(String(th));
    }

    chartMappingObject.chartLabels.push('');

    const numericEquals = mapping.equals as unknown as number[];
    const numericLowers = mapping.lowers as unknown as number[];
    const numericGreaters = mapping.greaters as unknown as number[];

    const tmp: ChartDataSets = {
      label: 'Test 3',
      data: numericEquals
    };
    if (!chartMappingObject.chartData.includes(tmp)) {
      chartMappingObject.chartData.push(tmp);
    }

    chartMappingObject.chartData[0].data.splice(0, 0, numericLowers[0]);
    chartMappingObject.chartData[0].data.push(numericGreaters[numericGreaters.length - 1]);

    return chartMappingObject;
  }

  /**
   * Using external library to build the cytoscape core by converting the input JSON
   * @param json CX file
   * @param canvas HTML target
   */
  convertCxToJs(json: any[], canvas: HTMLElement): Promise<cytoscape.Core> {

    if (!json || !canvas) {
      console.log('Either data or canvas is missing');
      return null;
    }

    const startTime = new Date().getTime();
    const utils = new CyNetworkUtils();
    const niceCX = utils.rawCXtoNiceCX(json);
    const conversion = new CxToJs(utils);

    const attributeNameMap = {};
    const elements = conversion.cyElementsFromNiceCX(niceCX, attributeNameMap);
    const style = conversion.cyStyleFromNiceCX(niceCX, attributeNameMap);
    const cyBackgroundColor = conversion.cyBackgroundColorFromNiceCX(niceCX);
    const layout = conversion.getDefaultLayout();
    const zoom = conversion.cyZoomFromNiceCX(niceCX);
    const pan = conversion.cyPanFromNiceCX(niceCX);

    canvas.style.backgroundColor = cyBackgroundColor;

    const networkConfig: cytoscape.CytoscapeOptions = {
      container: canvas,
      style,
      elements,
      layout,
      zoom,
      pan
    };

    const endTime = new Date().getTime();
    console.log('Time of conversion in ms: ' + Number(endTime - startTime));

    let core = cytoscape(networkConfig);
    core = this.addUtilitySelectors(core);

    return new Promise<cytoscape.Core>(
      (resolve, reject) => {
        resolve(core);
        reject(undefined);
      }
    );
  }

  /**
   * Utility styles, such as custom_highlight_color
   * and hide_label are added and toggled here to the current core
   * @param core current network's core
   * @private
   */
  private addUtilitySelectors(core: cytoscape.Core): cytoscape.Core {

    const styleJson: NeStyle[] = core.style().json();

    for (const s of styleJson) {
      s.priority = UtilityService.utilFindPriorityBySelector(s.selector);
    }

    const styleHighlight: NeStyle = {
      selector: '.custom_highlight_color',
      style: {
        'background-color': '#ff0000',
        'line-color': '#ff0000',
        'target-arrow-color': '#ff0000',
        'source-arrow-color': '#ff0000'
      },
      priority: 4
    };

    const styleLabel: NeStyle = {
      selector: '.hide_label',
      style: {
        label: ''
      },
      priority: 4
    };

    const orderedStyle: any[] = UtilityService
      .utilOrderStylesByPriority(styleJson.concat([styleHighlight].concat([styleLabel])));

    core.style(orderedStyle);
    core.elements().addClass('custom_highlight_color hide_label');
    core.elements().toggleClass('custom_highlight_color', false);
    core.elements().toggleClass('hide_label', (!this.utilityService.utilShowLabels(core)));
    return core;
  }

  /**
   * Does not override any of the initially defined network properties.
   * Simply recalculates the core for this network, ID is the same as before
   * @param network Network to be recalculated
   * @param container corresponding canvas HTML Element
   */
  rebuildCoreForNetwork(network: NeNetwork, container: HTMLElement): Promise<NeNetwork> {
    return this.convertCxToJs(network.cx, container)
      .then(core => {
        network.core = core;
        return network;
      })
      .catch(e => {
        console.error(e);
        return network;
      });
  }

  /**
   * Parses a file from .cx to cytoscape.js interpretable data
   *
   * @param container canvas rendering the network
   * @param filedata data of the .cx file
   * @param filename name of original file
   * @param uuid optionally give the uuid for copy-to-clipboard-feature
   * @param networkId id for this network
   */
  convert(
    container: HTMLElement,
    filedata: any[],
    filename: string,
    uuid: string = null,
    networkId: number
  ): Promise<NeNetwork> {
    let networkAttributeData;

    filedata.forEach(obj => {
      if (obj.networkAttributes) {
        networkAttributeData = obj.networkAttributes;
      }
    });

    const networkInformation: NeNetworkInformation = {
      name: '',
      rightsholder: '',
      networkType: '',
      organism: '',
      description: '',
      originalFilename: filename,
      uuid
    };

    for (const na of networkAttributeData || []) {
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

    let core = null;
    const id = networkId;
    const mappings = this.convertMappingsByFile(filedata);

    if (container) {
      return this.convertCxToJs(filedata, container)
        .then(receivedCore => {
          core = receivedCore;
          return {
            id,
            cx: filedata,
            filename,
            core,
            networkInformation,
            showLabels: this.utilityService.utilShowLabels(core),
            mappings,
          };
        })
        .catch(e => {
          console.error(e);
          return {
            id,
            cx: filedata,
            filename,
            core,
            networkInformation,
            showLabels: this.utilityService.utilShowLabels(core),
            mappings
          };
        });
    } else {
      return new Promise<NeNetwork>((resolve) => {
        resolve({
          id,
          cx: filedata,
          filename,
          core,
          networkInformation,
          mappings
        });
      });
    }
  }

  /**
   * Interprets mappings within the CX data model.
   * Also triggers building of chart data and color gradients.
   *
   * @param filedata CX data, possibly containing mappings
   * @private
   */
  private convertMappingsByFile(filedata: any[]): NeMappingsMap {

    const mappings: NeMappingsMap = {
      nodesDiscrete: [],
      nodesContinuous: [],
      edgesDiscrete: [],
      edgesContinuous: []
    };

    const tmpND: NeMappingDiscrete[] = [];
    const tmpED: NeMappingDiscrete[] = [];

    for (const fd of filedata) {

      if (fd.cyVisualProperties) {
        for (const prop of fd.cyVisualProperties) {
          const isNode = (prop.properties_of === 'nodes' || prop.properties_of === 'nodes:default');

          if (prop.mappings) {

            for (const mapKey of Object.keys(prop.mappings)) {
              const isDiscrete = prop.mappings[mapKey].type === 'DISCRETE';
              const isContinuous = prop.mappings[mapKey].type === 'CONTINUOUS';

              if (isDiscrete) {
                const definition: NeMappingDiscrete = ParseService.parseDefinitionDiscrete(prop.mappings[mapKey], mapKey);
                if (isNode) {
                  // nd
                  tmpND.push(definition); // todo consolidate to display as one mapping
                  // mappings.nodesDiscrete.push(definition);

                } else {
                  // ed
                  tmpED.push(definition); // todo consolidate to display as one mapping
                  // mappings.edgesDiscrete.push(definition);

                }
              } else if (isContinuous) {
                const definition = this.parseDefinitionContinuous(prop.mappings[mapKey], mapKey);
                if (isNode) {
                  // nc
                  mappings.nodesContinuous.push(definition);
                } else {
                  // ec
                  mappings.edgesContinuous.push(definition);
                }
              }
            }
          }
        }
      }
    }

    mappings.nodesDiscrete = this.groupDiscreteMappingsByCol(tmpND);
    mappings.edgesDiscrete = this.groupDiscreteMappingsByCol(tmpED);

    console.log(mappings);

    return mappings;
  }

  private parseDefinitionContinuous(obj: any, styleProperty: string): any {

    if (!obj || !obj.definition || !styleProperty) {
      console.log('No definition given');
      return [];
    }

    const mappingContinuous: NeMappingContinuous = {
      col: null,
      styleProperty,
      type: null,
      lowers: null,
      equals: null,
      greaters: null,
      thresholds: null,
      chart: null,
      colorGradient: null,
      isColor: true
    };

    const tmpL = [];
    const tmpE = [];
    const tmpG = [];
    const tmpOV = [];

    const commaSplit = obj.definition.split(',');

    for (const cs of commaSplit) {
      const equalSplit = cs.split('=');

      switch (equalSplit[0]) {
        case 'COL':
          mappingContinuous.col = equalSplit[1];
          break;
        case 'T':
          mappingContinuous.type = equalSplit[1];
          break;
        case 'L':
          if (mappingContinuous.isColor && (equalSplit[2].length !== 7 || equalSplit[2].indexOf('#') !== 0)) {
            mappingContinuous.isColor = false;
          }
          tmpL.splice(equalSplit[1], 0, equalSplit[2]);
          break;
        case 'E':
          if (mappingContinuous.isColor && (equalSplit[2].length !== 7 || equalSplit[2].indexOf('#') !== 0)) {
            mappingContinuous.isColor = false;
          }
          tmpE.splice(equalSplit[1], 0, equalSplit[2]);
          break;
        case 'G':
          if (mappingContinuous.isColor && (equalSplit[2].length !== 7 || equalSplit[2].indexOf('#') !== 0)) {
            mappingContinuous.isColor = false;
          }
          tmpG.splice(equalSplit[1], 0, equalSplit[2]);
          break;
        case 'OV':
          tmpOV.splice(equalSplit[1], 0, equalSplit[2]);
          break;

      }
    }

    mappingContinuous.thresholds = tmpOV;
    mappingContinuous.lowers = tmpL;
    mappingContinuous.equals = tmpE;
    mappingContinuous.greaters = tmpG;

    if (mappingContinuous.isColor) {
      mappingContinuous.colorGradient = ParseService.buildColorGradient(mappingContinuous);
      mappingContinuous.chart = null;
    } else {
      mappingContinuous.chart = this.buildChartData(mappingContinuous);
      mappingContinuous.colorGradient = null;
    }

    return mappingContinuous;
  }

  /**
   * Groups a list of discrete mappings to be displayed as a singular mappping.
   * Facilitates why a specific node is displayed a certain way, instead of
   * inspecting each mapping separately
   * @param mappings List of discrete mappings
   * @private
   */
  private groupDiscreteMappingsByCol(mappings: NeMappingDiscrete[]): NeGroupedMappingsDiscrete[] {
    if (!mappings || mappings.length === 0) {
      console.log('No mappings to group');
      return [];
    }

    // todo needs testing for complex discrete mappings (same styleProperties => different node/edge attribute)
    const group: NeGroupedMappingsDiscrete[] = [];

    outer: for (const map of mappings) {

      for (const item of group) {
        if (item.classifier === map.col) {
          const match = group.find(a => a.classifier === map.col);

          const displayThMatch = this.utilityService.utilRemovePrefix(map.styleProperty, ['NODE_', 'EDGE_']);

          const newStyle: NeStyleMap = {
            cssKey: map.styleProperty,
            cssValues: map.values as string[],
            isColor: (map.values as string[]).filter(a => !a.startsWith('#')).length === 0
          };

          if (!match.styleMap.includes(newStyle) &&
            !match.th.includes(displayThMatch)) {
            match.styleMap.push(newStyle);
            match.th.push(displayThMatch);
          }

          continue outer;
        }
      }
      const displayTh = this.utilityService.utilRemovePrefix(map.styleProperty, ['NODE_', 'EDGE_']);

      const style: NeStyleMap = {
        cssKey: map.styleProperty,
        cssValues: map.values as string[],
        isColor: (map.values as string[]).filter(a => !a.startsWith('#')).length === 0
      };
      const groupedMapping: NeGroupedMappingsDiscrete = {
        classifier: map.col,
        styleMap: [style],
        th: [displayTh],
        values: map.keys as string[],
        datatype: map.type
      };
      group.push(groupedMapping);
    }

    return group;
  }


}
