import {Injectable} from '@angular/core';
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
import {NeMappingsMap} from '../models/ne-mappings-map';
import {NeMappingDiscrete} from '../models/ne-mapping-discrete';
import {NeMappingContinuous} from '../models/ne-mapping-continuous';
import {NeGroupedMappingsDiscrete} from '../models/ne-grouped-mappings-discrete';
import {NeAspect} from '../models/ne-aspect';
import {NeChartType} from '../models/ne-chart-type';
import {DataService} from './data.service';
import {NeStyleMap} from "../models/ne-style-map";

@Injectable({
  providedIn: 'root'
})

/**
 * Service for parsing of .cx and cytoscape files
 */
export class ParseService {

  constructor(
    private utilityService: UtilityService,
    private dataService: DataService
  ) {
    dataService.networkChangedEmitter.subscribe(network => {
      dataService.selectedNetwork.mappings = this.convertMappingsByFile(network.cx);
    });
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
      numericThreshold: '-1'
    });
    for (const th of thresholds) {
      const offset = ((Number(th) - Number(thresholds[0])) * 100 / range).toFixed(0);
      const gradient: NeColorGradient = {
        color: equals[thresholds.indexOf(th)],
        offset: String(offset).concat('%'),
        numericThreshold: th
      };
      colorGradientCollection.push(gradient);
    }
    colorGradientCollection.push({
      color: greaters[greaters.length - 1],
      offset: '101',
      numericThreshold: '101'
    });

    return colorGradientCollection;
  }

  /**
   * Gathers attributes for which a mapping can be created
   * @param attributes
   * @param mappings
   * @private
   */
  private convertAkvByFile(attributes: any, mappings: NeMappingsMap): NeAspect[] {
    const akvs: NeAspect[] = [];
    for (const attr of attributes) {

      let found = false;

      for (const akv of akvs) {

        if (akv.name === attr.n) {

          found = true;

          if (!akv.values.includes(attr.v)) {
            akv.values.push(attr.v);
          }
        }
      }

      if (!found) {
        const tmp: NeAspect = {
          name: attr.n,
          values: [attr.v],
          datatype: attr.d ?? 'string',
          mapPointerD: [],
          mapPointerC: [],
          validForContinuous: false
        };
        akvs.push(tmp);
      }
    }

    for (const akv of akvs) {

      if (this.utilityService.utilFitForContinuous(akv)) {
        akv.validForContinuous = true;
        let max = Number.MIN_SAFE_INTEGER;
        let min = Number.MAX_SAFE_INTEGER;
        for (const v of akv.values as unknown as number[]) {
          if (v < min) {
            min = v;
          }
          if (v > max) {
            max = v;
          }
        }
        akv.max = max;
        akv.min = min;
      }

      for (let i = 0; i < mappings.nodesDiscrete.length; i++) {
        if (mappings.nodesDiscrete[i].col === akv.name) {
          akv.mapPointerD.push('nd' + i);
        }
      }

      for (let i = 0; i < mappings.edgesDiscrete.length; i++) {
        if (mappings.edgesDiscrete[i].col === akv.name) {
          akv.mapPointerD.push('ed' + i);
        }
      }

      for (let i = 0; i < mappings.nodesContinuous.length; i++) {
        if (mappings.nodesContinuous[i].col === akv.name) {
          akv.mapPointerC.push('nc' + i);
        }
      }

      for (let i = 0; i < mappings.edgesContinuous.length; i++) {
        if (mappings.edgesContinuous[i].col === akv.name) {
          akv.mapPointerC.push('ec' + i);
        }
      }
    }

    return akvs;
  }

  /**
   * Interprets a continuous mapping and elicits all their thresholds to display intuitively
   *
   * @param obj
   * @param styleProperty
   * @private
   */
  private parseDefinitionContinuous(obj: any, styleProperty: string): NeMappingContinuous {

    if (!obj || !obj.definition || !styleProperty) {
      console.log('No definition given');
      return null;
    }

    const mappingContinuous: NeMappingContinuous = {
      col: null,
      styleProperty,
      cleanStyleProperty: this.utilityService.utilRemovePrefix(styleProperty, ['EDGE_', 'NODE_']),
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
   * Builds chart data based on the given continuous mapping,
   * may only be applied to non-color mappings
   * @param mapping continuous mapping to be displayed as chart
   * @private
   */
  private buildChartData(mapping: NeMappingContinuous): NeChart {

    const chartMappingObject: NeChart = {
      chartData: [],
      chartType: {
        bar: false,
        line: true
      },
      chartLabels: [],
      chartOptions: {
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

    const numericEquals = [].concat(mapping.equals as unknown as number[]);
    const numericLowers = [].concat(mapping.lowers as unknown as number[]);
    const numericGreaters = [].concat(mapping.greaters as unknown as number[]);

    const tmp: ChartDataSets = {
      label: this.utilityService.utilRemovePrefix(mapping.styleProperty, ['EDGE_', 'NODE_']),
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
   */
  rebuildCoreForNetwork(network: NeNetwork): Promise<NeNetwork> {
    if (!this.dataService.canvas) {
      console.log('No canvas specified!');
      return null;
    }
    return this.convertCxToJs(network.cx, this.dataService.canvas)
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

    let akvNodes: NeAspect[] = [];
    let akvEdges: NeAspect[] = [];
    for (const fd of filedata) {
      if (fd.nodeAttributes) {
        akvNodes = this.convertAkvByFile(fd.nodeAttributes, mappings);
      }
      if (fd.edgeAttributes) {
        akvEdges = this.convertAkvByFile(fd.edgeAttributes, mappings);
      }
    }

    akvNodes = this.buildDistributionChart(akvNodes, filedata, true);
    akvEdges = this.buildDistributionChart(akvEdges, filedata, false);

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
            aspectKeyValueNodes: akvNodes,
            aspectKeyValueEdges: akvEdges
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
            mappings,
            aspectKeyValueNodes: akvNodes,
            aspectKeyValueEdges: akvEdges
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
          mappings,
          aspectKeyValuesNodes: akvNodes,
          aspectKeyValuesEdges: akvEdges
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
                  tmpND.push(definition);
                } else {
                  // ed
                  tmpED.push(definition);
                }
              } else if (isContinuous) {
                const definition = this.parseDefinitionContinuous(prop.mappings[mapKey], mapKey);
                if (isNode && isContinuous) {
                  // nc
                  mappings.nodesContinuous.push(definition);
                } else if (isContinuous) {
                  // ec
                  mappings.edgesContinuous.push(definition);
                }
              }
            }
          }
        }
      }
    }

    mappings.nodesDiscrete = tmpND;
    mappings.edgesDiscrete = tmpED;

    return mappings;
  }

  /**
   * Groups a list of discrete mappings to be displayed as a singular mappping.
   * Facilitates why a specific node is displayed a certain way, instead of
   * inspecting each mapping separately
   * @param mappings List of discrete mappings
   * @private
   */
  // private groupDiscreteMappingsByCol(mappings: NeMappingDiscrete[]): NeGroupedMappingsDiscrete[] {
  //   if (!mappings || mappings.length === 0) {
  //     console.log('No mappings to group');
  //     return [];
  //   }
  //
  //   console.log(mappings);
  //
  //   const group: NeGroupedMappingsDiscrete[] = [];
  //
  //   for (const newItem of mappings) {
  //     let found = false;
  //     for (const groupItem of group) {
  //
  //       if (groupItem.col === newItem.col) {
  //         found = true;
  //
  //         const newStyle: NeStyleMap = {
  //           attributeValues: newItem.keys as string[],
  //           cssKey: newItem.styleProperty,
  //           cssValues: newItem.values as string[],
  //           isColor: (newItem.values as string[]).filter(a => !a.startsWith('#')).length === 0
  //         };
  //
  //         groupItem.styleMap.push(newStyle);
  //         groupItem.th.push(this.utilityService.utilRemovePrefix(newItem.styleProperty, ['NODE_', 'EDGE_']));
  //
  //         for (const k of newItem.keys) {
  //           if (!groupItem.values.includes(k as string)) {
  //             groupItem.values.push(k as string);
  //           }
  //         }
  //       }
  //     }
  //
  //     if (!found) {
  //       // no COL matched => build new group
  //       const newStyle: NeStyleMap = {
  //         attributeValues: newItem.keys as string[],
  //         cssKey: newItem.styleProperty,
  //         cssValues: newItem.values as string[],
  //         isColor: (newItem.values as string[]).filter(a => !a.startsWith('#')).length === 0
  //       };
  //
  //       const newGroup: NeGroupedMappingsDiscrete = {
  //         col: newItem.col,
  //         datatype: newItem.type,
  //         styleMap: [newStyle],
  //         th: [this.utilityService.utilRemovePrefix(newItem.styleProperty, ['NODE_', 'EDGE_'])],
  //         values: newItem.keys as string[]
  //       };
  //
  //       if (!group.includes(newGroup)) {
  //         group.push(newGroup);
  //       }
  //     }
  //   }
  //
  //   return group;
  // }

  /**
   * Builds distribution charts per aspect
   * @param akvs List of aspects for which the charts are to be built
   * @param filedata data containing occurances for each aspect
   * @param isNode true, if aspects are applied to nodes
   * @private
   */
  private buildDistributionChart(akvs: NeAspect[], filedata: any[], isNode: boolean): NeAspect[] {

    const discreteAkvs = this.utilityService.utilFilterForDiscrete(akvs);
    const continuousAkvs = this.utilityService.utilFilterForContinuous(akvs, true);

    let numberOfNodes;
    let numberOfEdges;

    for (const fd of filedata) {
      if (fd.metaData) {
        for (const md of fd.metaData) {
          if (md.name === 'nodes') {
            numberOfNodes = md.elementCount;
          }
          if (md.name === 'edges') {
            numberOfEdges = md.elementCount;
          }
        }
      }
    }

    const chartType: NeChartType = {
      bar: true,
      line: false
    };

    for (const akv of discreteAkvs) {

      const chartData: ChartDataSets[] = [{
        data: [],
        label: akv.name
      }];

      const chart: NeChart = {
        chartColors: this.utilityService.utilGetRandomColorForChart(),
        chartData,
        chartLabels: akv.values,
        chartType
      };

      for (const v of akv.values) {
        let vCount = 0;

        for (const fd of filedata) {
          if (isNode) {
            if (fd.nodeAttributes) {
              for (const na of fd.nodeAttributes) {
                if (na.n === akv.name && na.v === v) {
                  vCount++;
                }
              }
            }
          } else {
            if (fd.edgeAttributes) {
              for (const ea of fd.edgeAttributes) {
                if (ea.n === akv.name && ea.v === v) {
                  vCount++;
                }
              }
            }
          }
        }
        chart.chartData[0].data.push(vCount);
      }
      akv.chartDiscreteDistribution = chart;
      akv.coverage = this.getCoverageByChart(chart, isNode ? numberOfNodes : numberOfEdges);
    }

    for (const akv of continuousAkvs) {
      const binSize = this.utilityService.utilSturgesRule(akv.values as unknown as number[]);
      const chart = this.utilityService.utilCalculateHistogramDataForBinSize(binSize, akv, ['OCCURANCES', 'BINS']);
      akv.chartContinuousDistribution = chart;
      akv.binSize = binSize;
      akv.coverage = this.getCoverageByChart(chart, isNode ? numberOfNodes : numberOfEdges);
    }
    return discreteAkvs.concat(continuousAkvs);
  }

  /**
   * Calculates percentage of element coverage per aspect
   * @param chart Chart containing occurance counts for each aspect
   * @param elementCount number of nodes or edges
   * @private
   */
  private getCoverageByChart(chart: NeChart, elementCount: any): string {
    const tmpData = chart.chartData[0].data as number[];
    const sum = this.utilityService.utilSum(tmpData);
    return ((sum / elementCount) * 100).toFixed(0);
  }

  private consolidateAttributePointer(mapping: NeGroupedMappingsDiscrete): NeGroupedMappingsDiscrete {
    console.log(mapping);
    const setAttributeValues = [];

    for (const style of mapping.styleMap) {
      for (const av of style.attributeValues) {
        if (!setAttributeValues.includes(av)) {
          setAttributeValues.push(av);
        }
      }
    }

    mapping.values = setAttributeValues;


    console.log(mapping);
    return mapping;
  }
}
