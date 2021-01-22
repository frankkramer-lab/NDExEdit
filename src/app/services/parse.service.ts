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

@Injectable({
  providedIn: 'root'
})

/**
 * Service for parsing of .cx and cytoscape files
 */
export class ParseService {

  /**
   * id used for networks in {@link GraphService#networksParsed|networksParsed}
   * @private
   */
  private id = 0;

  constructor(public http: HttpClient, private utilityService: UtilityService) {
  }

  /**
   * Builds the color gradient for this continuous mapping
   * @param thresholds list of thresholds
   * @param lowers list of lowers
   * @param equals list of equals
   * @param greaters list of greaters
   * @param lookup to property matching lookup
   * @param attribute attribute to define this color
   * @private
   */
  private buildColorGradient(
    thresholds: string[],
    lowers: string[],
    equals: string[],
    greaters: string[],
    lookup: string[],
    attribute: string
  ): NeColorGradient[] {

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

  /**
   * Builds chart data for this contiuous mapping
   * @param thresholds list of thresholds
   * @param lowers list of lowers
   * @param equals list of equals
   * @param greaters list of greaters
   * @param lookup to property matching lookup
   * @param attribute attribute to define this color
   * @private
   */
  private buildChartData(
    thresholds: string[],
    lowers: string[],
    equals: string[],
    greaters: string[],
    lookup: string[],
    attribute: any): NeChart {

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
          text: [lookup, attribute]
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

    for (const th of thresholds) {
      chartMappingObject.chartLabels.push(th);
    }

    chartMappingObject.chartLabels.push('');

    const numericEquals = equals as unknown as number[];
    const numericLowers = lowers as unknown as number[];
    const numericGreaters = greaters as unknown as number[];

    for (const lu of lookup) {
      const tmp: ChartDataSets = {
        label: lu,
        data: numericEquals
      };
      if (!chartMappingObject.chartData.includes(tmp)) {
        chartMappingObject.chartData.push(tmp);
      }
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
  convert(container: HTMLElement, filedata: any[], filename: string, uuid: string = null, networkId: number): Promise<NeNetwork> {
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

    for (const na of networkAttributeData) {
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

    const currentId = this.id;
    this.id++;
    let core = null;

    if (container) {
      return this.convertCxToJs(filedata, container)
        .then(receivedCore => {
          core = receivedCore;
          return {
            id: currentId,
            cx: filedata,
            filename,
            core,
            networkInformation,
            showLabels: this.utilityService.utilShowLabels(core)
          };
        })
        .catch(e => {
          console.error(e);
          return {
            id: currentId,
            cx: filedata,
            filename,
            core,
            networkInformation,
            showLabels: this.utilityService.utilShowLabels(core)
          };
        });
    } else {
      return new Promise<NeNetwork>((resolve) => {
        resolve({
          id: currentId,
          cx: filedata,
          filename,
          core,
          networkInformation
        });
      });
    }
  }

}
