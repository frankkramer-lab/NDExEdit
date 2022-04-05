import {Injectable} from '@angular/core';
import * as cytoscape from 'cytoscape';
import {NeNetworkInformation} from '../models/ne-network-information';
import {NeNetwork} from '../models/ne-network';
import {NeColorGradient} from '../models/ne-color-gradient';
import {ElementType, MappingType, UtilityService} from './utility.service';
import {NeChart} from '../models/ne-chart';
import {ChartDataSets} from 'chart.js';
import 'cytoscape-cx2js';
import {CxToJs, CyNetworkUtils} from 'cytoscape-cx2js';
import {NeMappingsMap} from '../models/ne-mappings-map';
import {NeMappingDiscrete} from '../models/ne-mapping-discrete';
import {NeMappingContinuous} from '../models/ne-mapping-continuous';
import {NeAspect} from '../models/ne-aspect';
import {NeChartType} from '../models/ne-chart-type';
import {DataService} from './data.service';
import {NeStyle} from '../models/ne-style';
import {NeMapping} from '../models/ne-mapping';
import {NeNode} from '../models/ne-node';
import {NeKeyValue} from '../models/ne-key-value';
import {PropertyService} from './property.service';

@Injectable({
  providedIn: 'root'
})

/**
 * Service for parsing of .cx and cytoscape files
 */
export class ParseService {

  attributeNameMap: any = {};

  constructor(
    private utilityService: UtilityService,
    private dataService: DataService,
  ) {
    dataService.networkChangedEmitter.subscribe(network => {
      dataService.selectedNetwork.mappings = this.convertMappingsByFile(network.cx);

      let akvNodes: NeAspect[] = [];
      let akvEdges: NeAspect[] = [];

      // rework mapPointers
      for (const fd of network.cx) {
        if (fd.nodeAttributes) {
          akvNodes = akvNodes.concat(this.convertAkvByFile(fd.nodeAttributes));
        }
        if (fd.edgeAttributes) {
          akvEdges = akvEdges.concat(this.convertAkvByFile(fd.edgeAttributes, false));
        }
        if (fd.nodes) {

          if (akvNodes.every(a => a.name !== 'name')) {

            const newAspect = ParseService.buildAspectByCx(fd.nodes, 'n', dataService.selectedNetwork.mappings);
            if (newAspect) {
              akvNodes.push(newAspect);
            }
          }
          if (akvNodes.every(a => a.name !== 'represents')) {
            const newAspect = ParseService.buildAspectByCx(fd.nodes, 'r', dataService.selectedNetwork.mappings);
            if (newAspect) {
              akvNodes.push(newAspect);
            }
          }
        }
        if (fd.edges) {
          if (akvEdges.every(a => a.name !== 'interaction')) {
            const newAspect = ParseService.buildAspectByCx(fd.edges, 'i', dataService.selectedNetwork.mappings);
            if (newAspect) {
              akvEdges.push(newAspect);

            }
          }
        }
      }
      akvNodes = this.buildDistributionChart(akvNodes, network.cx, ElementType.node);
      akvEdges = this.buildDistributionChart(akvEdges, network.cx, ElementType.edge);
      dataService.selectedNetwork.aspectKeyValuesNodes = akvNodes;
      dataService.selectedNetwork.aspectKeyValuesEdges = akvEdges;
    });
  }

  /**
   * Builds aspects which need specific handling, according to CX documentation those are
   * <ul>
   *   <li>node name</li>
   *   <li>node represents</li>
   *   <li>edge interaction</li>
   * </ul>
   * @param aspects
   * @param key
   * @param mappings
   * @private
   */
  private static buildAspectByCx(aspects: any[], key: string, mappings: NeMappingsMap): NeAspect {
    const isNode = (key === 'r' || key === 'n');
    let name;
    switch (key) {
      case 'r':
        name = 'represents';
        break;
      case 'n':
        name = 'name';
        break;
      case 'i':
        name = 'interaction';
        break;
    }

    const newAspect: NeAspect = {
      chartDiscreteDistribution: undefined,
      coverage: '',
      datatype: 'string',
      name,
      validForContinuous: false,
      values: []
    };

    for (const a of aspects) {
      if (a[key] && !newAspect.values.includes(a[key])) {
        newAspect.values.push(a[key]);
      }
    }

    return newAspect.values.length === 0 ? null : newAspect;
  }

  /**
   * Creates a discrete mapping object based on the definition string.
   * Keys and values are always considered to be strings
   *
   * @param obj JSON containing the mapping's definition
   * @param styleProperty Name of the property which is used for this mapping
   * @private
   */
  private static parseDefinitionDiscrete(obj: any, styleProperty: string): NeMappingDiscrete {

    if (!obj || !obj.definition || !styleProperty) {
      console.log('Parsing discrete mapping definition failed: No definition given!');
      return null;
    }

    const discreteMapping: NeMappingDiscrete = {
      col: null,
      mappingType: MappingType.discrete,
      type: null,
      styleProperty,
      keys: null,
      values: null,
      mapObject: null,
      useValue: [],
      newlyAdded: false
    };

    if (obj.definition.startsWith('*')) {
      discreteMapping.newlyAdded = true;
      obj.definition = obj.definition.substring(1);
    }

    const cleanDefinition = obj.definition.replace(/,,/g, '%');

    const commaSplit = cleanDefinition.split(',');
    const tmpV = [];
    const tmpK = [];

    if (discreteMapping.newlyAdded) {
      console.log('Found new discrete mapping! Setting defaults ...');

      discreteMapping.col = commaSplit[0].split('=')[1];
      discreteMapping.type = commaSplit[1].split('=')[1];
      discreteMapping.keys = [];
      discreteMapping.mapObject = [];
      discreteMapping.values = [];
      return discreteMapping;
    }

    for (let cs of commaSplit) {

      cs = cs.replace(/%/g, ',,');

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

    if (tmpV.length === 0) {
      return null;
    }

    discreteMapping.keys = tmpK;
    discreteMapping.values = tmpV;
    discreteMapping.mapObject = [];
    for (let i = 0; i < tmpK.length; i++) {
      discreteMapping.mapObject[tmpK[i]] = tmpV[i];
    }
    discreteMapping.useValue = Array(tmpV.length).fill(true);

    return discreteMapping;
  }

  /**
   * Builds the color gradient for a continuous mapping with color application
   * @param mapping Mapping to be interpreted as color mapping
   * @private
   */
  buildColorGradient(mapping: NeMappingContinuous): NeColorGradient[] {

    if (this.utilityService.utilContainsDuplicates(mapping)) {
      console.log('Cannot build gradient when duplicate values exist!');
      return null;
    }

    const thresholds = mapping.thresholds;
    const equals = mapping.equals;
    const greaters = mapping.greaters;
    const lowers = mapping.lowers;

    const colorGradientCollection: NeColorGradient[] = [];
    const range: number = Number(thresholds[thresholds.length - 1]) - Number(thresholds[0]);
    if (range === 0) {
      return [];
    }

    colorGradientCollection.push({
      color: lowers[0] as string,
      contrastColor: this.utilityService.utilGetContrastColorByHex(lowers[0] as string),
      labelColorWhite: this.utilityService.utilNeedsWhiteLabelText(lowers[0] as string),
      offset: '-1',
      numericOffset: null,
      offsetInterval: null,
      numericThreshold: '-1',
      selected: false
    });
    for (let i = 0; i < thresholds.length; i++) {

      if (mapping.useValue[i]) {
        const th = thresholds[i];

        const offset = ((Number(th) - Number(thresholds[0])) * 100 / range).toFixed(0);
        const gradient: NeColorGradient = {
          color: equals[thresholds.indexOf(th)] as string,
          contrastColor: this.utilityService.utilGetContrastColorByHex(equals[thresholds.indexOf(th)] as string),
          labelColorWhite: this.utilityService.utilNeedsWhiteLabelText(equals[thresholds.indexOf(th)] as string),
          offset: offset.concat('%'),
          numericOffset: Number(offset),
          offsetInterval: null,
          numericThreshold: th as unknown as string,
          selected: false
        };
        colorGradientCollection.push(gradient);
      }

    }
    colorGradientCollection.push({
      color: greaters[greaters.length - 1] as string,
      contrastColor: this.utilityService.utilGetContrastColorByHex(greaters[greaters.length - 1] as string),
      labelColorWhite: this.utilityService.utilNeedsWhiteLabelText(greaters[greaters.length - 1] as string),
      offset: '101',
      numericOffset: null,
      offsetInterval: null,
      numericThreshold: '101',
      selected: false
    });

    for (let i = 1; i < colorGradientCollection.length - 1; i++) {
      if (colorGradientCollection[i].offset !== '-1' && colorGradientCollection[i].offset !== '101') {
        colorGradientCollection[i].offsetInterval = String(colorGradientCollection[i].numericOffset
          - colorGradientCollection[i - 1].numericOffset);
      }

    }
    return colorGradientCollection;
  }

  /**
   * Using external library to build the cytoscape core by converting the input JSON
   * @param json CX file
   * @param canvas HTML target
   */
  convertCxToJs(json: any[], canvas: HTMLElement): Promise<cytoscape.Core> {

    if (!json || !canvas) {
      console.log('Either data or canvas is missing while trying to convert CX to JS');
      return null;
    }

    const utils = new CyNetworkUtils();

    const niceCX = utils.rawCXtoNiceCX(json);
    const conversion = new CxToJs(utils);

    const elements = conversion.cyElementsFromNiceCX(niceCX, this.attributeNameMap);
    const style = conversion.cyStyleFromNiceCX(niceCX, this.attributeNameMap);

    if (!('interaction' in this.attributeNameMap)) {
      this.attributeNameMap = {...this.attributeNameMap, interaction: 'interaction'};
    }

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

    let core: cytoscape.Core;
    core = cytoscape(networkConfig);
    core = this.addUtilitySelectors(core);

    return new Promise<cytoscape.Core>(
      (resolve, reject) => {
        resolve(core);
        reject(undefined);
      }
    );
  }

  /**
   * Does not override any of the initially defined network properties.
   * Simply recalculates the core for this network, ID is the same as before
   * @param network Network to be recalculated
   */
  rebuildCoreForNetwork(network: NeNetwork): Promise<NeNetwork> {
    if (!this.dataService.getCanvas()) {
      console.log('No canvas specified! Building the Cytoscape.js core requires a canvas.');
      return null;
    }
    this.attributeNameMap = {};

    return this.convertCxToJs(network.cx, this.dataService.getCanvas())
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
  async convert(
    container: HTMLElement,
    filedata: any[],
    filename: string,
    uuid: string = null,
    networkId: number
  ): Promise<NeNetwork> {

    let networkAttributeData;
    let ndexStatusData = [{}];

    for (const obj of filedata) {
      if (obj.networkAttributes) {
        networkAttributeData = obj.networkAttributes;
      } else if (obj.ndexStatus) {
        ndexStatusData = obj.ndexStatus;
      }
    }

    const networkInformation: NeNetworkInformation = {
      name: '',
      uuid: uuid ?? null,
      information: [],
      status: []
    };


    for (const key of Object.keys(ndexStatusData[0])) {
      const statusItem: NeKeyValue = {
        name: key,
        value: ndexStatusData[0][key]
      };
      networkInformation.status.push(statusItem);
    }

    for (const na of networkAttributeData || []) {

      if (na.n === 'name') {
        networkInformation.name = (filename === 'DEMO' ? 'Demo: ' : '') + na.v;
      }

      const informationItem: NeKeyValue = {
        name: na.n,
        value: na.v,
        datatype: na.d ?? null
      };

      networkInformation.information.push(informationItem);
    }

    let core = null;
    const id = networkId;
    const cyVisualIndex = filedata.findIndex((a) => a.cyVisualProperties !== undefined && a.cyVisualProperties !== null);

    if (cyVisualIndex === -1) {
      console.log('No cytoscape style aspect found! Setting default styles ...');
      const defaultStyles = await this.dataService.getDefaultStyles().toPromise();
      filedata.push({
        cyVisualProperties: Object.values(defaultStyles)
      });
    }

    const mappings = this.convertMappingsByFile(filedata);

    let akvNodes: NeAspect[] = [];
    let akvEdges: NeAspect[] = [];
    let akvNodesNames: string[] = [];
    let akvEdgesNames: string[] = [];
    let initialLayout: NeNode[] = [];

    for (const fd of filedata) {

      if (fd.nodeAttributes) {
        akvNodes = akvNodes.concat(this.convertAkvByFile(fd.nodeAttributes));
        akvNodesNames = akvNodes.map(a => a.name);
      }
      if (fd.edgeAttributes) {
        akvEdges = akvEdges.concat(this.convertAkvByFile(fd.edgeAttributes, false));
        akvEdgesNames = akvEdges.map(a => a.name);
      }

      if (fd.nodes) {
        if (akvNodes.every(a => a.name !== 'name')) {
          const newAspect = ParseService.buildAspectByCx(fd.nodes, 'n', mappings);
          if (newAspect) {
            akvNodes.push(newAspect);
          }
        }
        if (akvNodes.every(a => a.name !== 'represents')) {
          const newAspect = ParseService.buildAspectByCx(fd.nodes, 'r', mappings);
          if (newAspect) {
            akvNodes.push(newAspect);
          }
        }
      }
      if (fd.edges) {
        if (akvEdges.every(a => a.name !== 'interaction')) {
          const newAspect = ParseService.buildAspectByCx(fd.edges, 'i', mappings);
          if (newAspect) {
            akvEdges.push(newAspect);

          }
        }
      }
      if (fd.cartesianLayout) {

        const layout = [];
        for (const item of fd.cartesianLayout) {
          layout.push(Object.assign({}, item));
        }
        initialLayout = layout;
      }
    }

    // validate node mappings
    for (let i = 0; i < mappings.nodesPassthrough.length; i++) {
      const mapping = mappings.nodesPassthrough[i];
      if (!akvNodesNames.includes(mapping.col) && mapping.col !== 'name' && mapping.col !== 'represents') {
        mappings.nodesPassthrough.splice(i, 1);
        for (const aspect of filedata[cyVisualIndex].cyVisualProperties) {
          if (aspect.properties_of === 'nodes:default') {
            if (aspect.mappings) {
              delete aspect.mappings[mapping.styleProperty];
            }
          }
        }
      }
    }
    for (let i = 0; i < mappings.nodesDiscrete.length; i++) {
      const mapping = mappings.nodesDiscrete[i];
      if (!akvNodesNames.includes(mapping.col) && mapping.col !== 'name' && mapping.col !== 'represents') {
        mappings.nodesDiscrete.splice(i, 1);
        for (const aspect of filedata[cyVisualIndex].cyVisualProperties) {
          if (aspect.properties_of === 'nodes:default') {
            if (aspect.mappings) {
              delete aspect.mappings[mapping.styleProperty];
            }
          }
        }
      }
    }
    for (let i = 0; i < mappings.nodesContinuous.length; i++) {
      const mapping = mappings.nodesContinuous[i];
      if (!akvNodesNames.includes(mapping.col) && mapping.col !== 'name' && mapping.col !== 'represents') {
        mappings.nodesContinuous.splice(i, 1);
        for (const aspect of filedata[cyVisualIndex].cyVisualProperties) {
          if (aspect.properties_of === 'nodes:default') {
            if (aspect.mappings) {
              delete aspect.mappings[mapping.styleProperty];
            }
          }
        }
      }
    }

    // validate edge mappings
    for (let i = 0; i < mappings.edgesPassthrough.length; i++) {
      const mapping = mappings.edgesPassthrough[i];
      if (!akvEdgesNames.includes(mapping.col) && mapping.col !== 'interaction') {
        mappings.edgesPassthrough.splice(i, 1);
        for (const aspect of filedata[cyVisualIndex].cyVisualProperties) {
          if (aspect.properties_of === 'edges:default') {
            if (aspect.mappings) {
              delete aspect.mappings[mapping.styleProperty];
            }
          }
        }
      }
    }
    for (let i = 0; i < mappings.edgesDiscrete.length; i++) {
      const mapping = mappings.edgesDiscrete[i];
      if (!akvEdgesNames.includes(mapping.col) && mapping.col !== 'interaction') {
        mappings.edgesContinuous.splice(i, 1);
        for (const aspect of filedata[cyVisualIndex].cyVisualProperties) {
          if (aspect.properties_of === 'edges:default') {
            if (aspect.mappings) {
              delete aspect.mappings[mapping.styleProperty];
            }
          }
        }
      }
    }
    for (let i = 0; i < mappings.edgesContinuous.length; i++) {
      const mapping = mappings.edgesContinuous[i];
      if (!akvEdgesNames.includes(mapping.col) && mapping.col !== 'interaction') {
        mappings.edgesContinuous.splice(i, 1);
        for (const aspect of filedata[cyVisualIndex].cyVisualProperties) {
          if (aspect.properties_of === 'edges:default') {
            if (aspect.mappings) {
              delete aspect.mappings[mapping.styleProperty];
            }
          }
        }
      }
    }

    akvNodes = this.buildDistributionChart(akvNodes, filedata, ElementType.node);
    akvEdges = this.buildDistributionChart(akvEdges, filedata, ElementType.edge);

    if (container) {
      return this.convertCxToJs(filedata, container)
        .then(receivedCore => {
          core = receivedCore;
          return {
            id,
            cx: filedata,
            filename,
            core,
            initialLayout, // will be set to current layout on core rebuild
            networkInformation,
            showLabels: this.utilityService.utilShowLabels(core),
            mappings,
            aspectKeyValueNodes: akvNodes,
            aspectKeyValueEdges: akvEdges,
          };
        })
        .catch(e => {
          console.error(e);
          return {
            id,
            cx: filedata,
            filename,
            core,
            initialLayout,
            networkInformation,
            showLabels: this.utilityService.utilShowLabels(core),
            mappings,
            aspectKeyValueNodes: akvNodes,
            aspectKeyValueEdges: akvEdges,
          };
        });
    } else {
      return new Promise<NeNetwork>((resolve) => {
        resolve({
          id,
          cx: filedata,
          filename,
          core,
          initialLayout,
          networkInformation,
          mappings,
          aspectKeyValuesNodes: akvNodes,
          aspectKeyValuesEdges: akvEdges,
        });
      });
    }
  }

  /**
   * Builds chart data based on the given continuous mapping,
   * may only be applied to non-color mappings
   * @param mapping continuous mapping to be displayed as chart
   * @private
   */
  buildChartData(mapping: NeMappingContinuous): NeChart {
    if (this.utilityService.utilContainsDuplicates(mapping)) {
      console.log('Found duplicate values while building chart data!');
      return null;
    }

    const thresholds = mapping.thresholds.filter(a => mapping.useValue[mapping.thresholds.indexOf(a)]);
    const equals = mapping.equals.filter(a => mapping.useValue[mapping.equals.indexOf(a)]);

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
        maintainAspectRatio: false
      }
    };

    for (const th of thresholds) {
      chartMappingObject.chartLabels.push(th as unknown as string);
    }

    const numericEquals = [].concat(equals as unknown as number[]);

    const tmp: ChartDataSets = {
      label: mapping.styleProperty,
      data: numericEquals
    };

    if (!chartMappingObject.chartData.includes(tmp)) {
      chartMappingObject.chartData.push(tmp);
    }

    return chartMappingObject;
  }

  /**
   * Gathers attributes for which a mapping can be created
   * @param attributes
   * @param isNode
   * @private
   */
  private convertAkvByFile(attributes: any[], isNode: boolean = true): NeAspect[] {
    const akvs: NeAspect[] = [];

    for (const attr of attributes) {
      let found = false;
      const isNumeric = (attr.d === 'double' || attr.d === 'integer' || attr.d === 'long');

      for (const akv of akvs) {
        if (akv.name === attr.n) {

          found = true;

          if (isNumeric && !akv.numericValues.includes(Number(attr.v))) {
            akv.numericValues.push(Number(attr.v));
          }

          if (!akv.values.includes(attr.v)) {
            akv.values.push(attr.v);
          }

        }
      }

      if (!found) {

        const tmp: NeAspect = {
          name: attr.n,
          values: [attr.v] as string[],
          numericValues: isNumeric ? [Number(attr.v)] : null,
          datatype: attr.d ?? 'string',
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
        for (const v of akv.numericValues) {

          if (v < min) {
            min = v;
          }
          if (v > max) {
            max = v;
          }
        }
        akv.max = Number(max);
        akv.min = Number(min);
      }
    }

    return akvs;
  }

  /**
   * Interprets a continuous mapping and elicits all their thresholds to display intuitively
   *
   * @param obj JSON containing the mapping's definition
   * @param styleProperty Name of the property which is used for this mapping
   * @private
   */
  private parseDefinitionContinuous(obj: any, styleProperty: string): NeMappingContinuous {

    if (!obj || !obj.definition || !styleProperty) {
      console.log('Parsing continuous mapping definition failed: No definition given!');
      return null;
    }

    const mappingContinuous: NeMappingContinuous = {
      col: null,
      useValue: [],
      styleProperty,
      mappingType: MappingType.continuous,
      type: null,
      lowers: null,
      equals: null,
      greaters: null,
      thresholds: null,
      duplicates: null,
      chart: null,
      colorGradient: null,
      isColor: true,
      newlyAdded: false
    };

    const tmpL = [];
    const tmpE = [];
    const tmpG = [];
    const tmpOV: number[] = [];

    if (obj.definition.startsWith('*')) {
      mappingContinuous.newlyAdded = true;
      obj.definition = obj.definition.substring(1);
    }

    const commaSplit = obj.definition.split(',');

    if (mappingContinuous.newlyAdded) {
      console.log('Found new continuous mapping! Setting defaults ...');

      mappingContinuous.isColor = PropertyService.colorProperties.includes(styleProperty);
      const defaultValue = mappingContinuous.isColor ? '#000000' : null;

      // assigning two thresholds by default with example values
      // also display empty input fields for assigned values to guide the user
      mappingContinuous.col = commaSplit[0].split('=')[1];
      mappingContinuous.type = commaSplit[1].split('=')[1];
      mappingContinuous.thresholds = [0, 1];
      mappingContinuous.useValue = [false, false];
      mappingContinuous.equals = [defaultValue, defaultValue];
      mappingContinuous.lowers = [defaultValue, defaultValue];
      mappingContinuous.greaters = [defaultValue, defaultValue];
      mappingContinuous.duplicates = [[], []];
      return mappingContinuous;
    }

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
          tmpOV.splice(equalSplit[1], 0, Number(equalSplit[2]));
          break;

      }
    }

    const duplicateMask: number[] = [];
    const uniqueThresholds: number[] = [];
    mappingContinuous.duplicates = Array(tmpE.length).fill(null);

    for (let i = 0; i < tmpOV.length; i++) {
      if (!uniqueThresholds.includes(tmpOV[i])) {
        uniqueThresholds.push(tmpOV[i]);
      } else {
        console.log('Found duplicate while parsing continuous mapping!');
        const firstOccurrence = tmpOV.findIndex(a => a === tmpOV[i]);
        duplicateMask.push(i);
        if (mappingContinuous.duplicates[i] !== null) {
          mappingContinuous.duplicates[firstOccurrence].push(tmpE[i]);
        } else {
          mappingContinuous.duplicates[firstOccurrence] = [tmpE[i]];
        }
      }
    }

    for (const duplicateIndex of duplicateMask) {
      tmpOV.splice(duplicateIndex, 1);
      tmpL.splice(duplicateIndex, 1);
      tmpE.splice(duplicateIndex, 1);
      tmpG.splice(duplicateIndex, 1);
      mappingContinuous.duplicates.splice(duplicateIndex, 1);
    }

    mappingContinuous.thresholds = tmpOV;
    mappingContinuous.lowers = Array(tmpOV.length).fill(mappingContinuous.isColor ? '#000000' : null);
    // mappingContinuous.lowers = tmpL;
    mappingContinuous.equals = tmpE;
    mappingContinuous.greaters = Array(tmpOV.length).fill(mappingContinuous.isColor ? '#000000' : null);
    // mappingContinuous.greaters = tmpG;
    mappingContinuous.useValue = Array(tmpOV.length).fill(true);

    if (mappingContinuous.isColor) {
      mappingContinuous.colorGradient = this.buildColorGradient(mappingContinuous);
      mappingContinuous.chart = null;
    } else {
      mappingContinuous.chart = this.buildChartData(mappingContinuous);
      mappingContinuous.colorGradient = null;
    }
    return mappingContinuous;
  }

  /**
   * Interprets a passthrough mapping and elicits col and style property
   *
   * @param obj JSON containing the mapping's definition
   * @param styleProperty Name of the property which is used for this mapping
   * @private
   */
  private parseDefinitionPassthrough(obj: any, styleProperty: string): NeMapping {

    if (!obj || !obj.definition || !styleProperty) {
      console.log('Parsing passthrough mapping definition failed: No definition given!');
      return null;
    }

    let newlyAdded = false;
    if (obj.definition.startsWith('*')) {
      obj.definition = obj.definition.substring(1);
      newlyAdded = true;
    }

    return {
      col: this.utilityService.utilExtractColByMappingString(obj.definition),
      styleProperty,
      mappingType: MappingType.passthrough,
      useValue: [],
      newlyAdded
    };

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
      edgesContinuous: [],
      nodesPassthrough: [],
      edgesPassthrough: [],
      nodesPropertiesDefault: [],
      nodesPropertiesSpecific: [],
      edgesPropertiesDefault: [],
      edgesPropertiesSpecific: [],
      networkDefault: []
    };

    for (const fd of filedata) {

      if (fd.cyVisualProperties) {
        for (const prop of fd.cyVisualProperties) {
          const isNode = (prop.properties_of === 'nodes' || prop.properties_of === 'nodes:default');

          // DEFAULTS
          if (prop.properties) {

            if (prop.properties_of === 'network') {

              // network
              for (const key of Object.keys(prop.properties)) {
                mappings.networkDefault.push({
                  name: key,
                  value: prop.properties[key]
                });
              }

            } else if (prop.properties_of === 'nodes' || prop.properties_of === 'edges') {

              // specifics
              for (const key of Object.keys(prop.properties)) {
                const item: NeKeyValue = {
                  name: key,
                  value: prop.properties[key],
                  reference: prop.applies_to
                };

                if (isNode && !PropertyService.irrelevantProperties.includes(key)) {
                  mappings.nodesPropertiesSpecific.push(item);
                } else if (!isNode && !PropertyService.irrelevantProperties.includes(key)) {
                  mappings.edgesPropertiesSpecific.push(item);
                }
              }

            } else if (prop.properties_of === 'nodes:default' || prop.properties_of === 'edges:default') {

              // defaults
              for (const key of Object.keys(prop.properties)) {
                const item: NeKeyValue = {
                  name: key,
                  value: prop.properties[key]
                };

                if (isNode && !PropertyService.irrelevantProperties.includes(key)) {
                  mappings.nodesPropertiesDefault.push(item);
                } else if (!isNode && !PropertyService.irrelevantProperties.includes(key)) {
                  mappings.edgesPropertiesDefault.push(item);
                }
              }
            }
          }

          // MAPPINGS
          if (prop.mappings) {

            for (const mapKey of Object.keys(prop.mappings)) {
              const isDiscrete = prop.mappings[mapKey].type === 'DISCRETE';
              const isContinuous = prop.mappings[mapKey].type === 'CONTINUOUS';
              const isPassthrough = prop.mappings[mapKey].type === 'PASSTHROUGH';

              if (isDiscrete) {
                const definition: NeMappingDiscrete = ParseService.parseDefinitionDiscrete(prop.mappings[mapKey], mapKey);
                if (isNode && definition !== null) {
                  // nd
                  mappings.nodesDiscrete.push(definition);
                } else if (definition !== null) {
                  // ed
                  mappings.edgesDiscrete.push(definition);
                }
              } else if (isContinuous) {
                const definition = this.parseDefinitionContinuous(prop.mappings[mapKey], mapKey);
                if (isNode && definition !== null) {
                  // nc
                  mappings.nodesContinuous.push(definition);
                } else if (definition !== null) {
                  // ec
                  mappings.edgesContinuous.push(definition);
                }
              } else if (isPassthrough) {
                if (isNode) {
                  mappings.nodesPassthrough.push(this.parseDefinitionPassthrough(prop.mappings[mapKey], mapKey));
                } else {
                  mappings.edgesPassthrough.push(this.parseDefinitionPassthrough(prop.mappings[mapKey], mapKey));
                }
              }
            }
          }

          // DEPENDENCIES
          if (!prop.dependencies) {
            prop.dependencies = {};
          }
        }
      }
    }

    return mappings;
  }

  /**
   * Builds distribution charts per aspect
   * @param akvs List of aspects for which the charts are to be built
   * @param filedata data containing occurances for each aspect
   * @param elementType Type of elements, either 'node' or 'edge'
   * @param specialKey indicates, that nodes or edges should be evaluated, based on the key.
   * This is necessary for the 'interaction' / 'name' properties
   * @private
   */
  private buildDistributionChart(
    akvs: NeAspect[],
    filedata: any[],
    elementType: ElementType,
    specialKey: string = null
  ): NeAspect[] {

    const discreteAkvs = this.utilityService.utilFilterForDiscrete(akvs); // includes passthrough valid properties
    const continuousAkvs = this.utilityService.utilFilterForContinuous(akvs, true);

    let numberOfNodes: number;
    let numberOfEdges: number;

    for (const fd of filedata) {
      if (fd.metaData) {
        for (const md of fd.metaData) {
          if (md.name === 'nodes') {
            numberOfNodes = md.elementCount as number;
          }
          if (md.name === 'edges') {
            numberOfEdges = md.elementCount as number;
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
        chartLabels: akv.values as string[],
        chartType,
        chartOptions: {
          scales: {
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: this.utilityService.xAxisDiscreteLabel || ''
              }
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: (this.utilityService.yAxisLabel + akv.name) || ''
              }
            }]
          },
          maintainAspectRatio: false,
          responsive: true
        }
      };

      for (const v of akv.values) {
        let vCount = 0;

        for (const fd of filedata) {
          if (elementType === ElementType.node) {

            // handle 'name' or 'represents'
            if (fd.nodes && (akv.name === 'name' || akv.name === 'represents')) {
              for (const n of fd.nodes) {
                if (akv.name === 'name' && n.n && n.n === v) {
                  vCount++;
                } else if (akv.name === 'represents' && n.r && n.r === v) {
                  vCount++;
                }
              }
            }

            if (fd.nodeAttributes) {
              for (const na of fd.nodeAttributes) {
                if (na.n === akv.name && na.v === v) {
                  vCount++;
                }
              }
            }
          } else {

            // handle 'interaction'
            if (fd.edges && akv.name === 'interaction') {
              for (const e of fd.edges) {
                if (e.i && e.i === v) {
                  vCount++;
                }
              }
            }

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
      akv.coverage = this.getCoverageByChart(chart, (elementType === ElementType.node) ? numberOfNodes : numberOfEdges);
    }

    for (const akv of continuousAkvs) {
      const binSize = this.utilityService.utilSturgesRule(akv.numericValues ?? []);
      const chart = this.utilityService.utilCalculateHistogramDataForBinSize(binSize, akv);
      akv.chartContinuousDistribution = chart;
      akv.binSize = binSize;
      akv.coverage = this.getCoverageByChart(chart, (elementType === ElementType.node) ? numberOfNodes : numberOfEdges);
    }

    return discreteAkvs.concat(continuousAkvs);
  }

  /**
   * Calculates percentage of element coverage per aspect
   * @param chart Chart containing occurrence counts for each aspect
   * @param elementCount number of nodes or edges
   * @private
   */
  private getCoverageByChart(chart: NeChart, elementCount: number): string {

    if (!chart || isNaN(elementCount)) {
      return '';
    }

    const occurrencesSum = this.utilityService.utilSum(chart.chartData[0].data as number[]);
    if (occurrencesSum !== null) {
      return ((occurrencesSum / elementCount) * 100).toFixed(0);
    }
    return '';
  }
}
