import {Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import {NeMappingsDefinition} from '../models/ne-mappings-definition';
import {NeStyle} from '../models/ne-style';
import {NeNode} from '../models/ne-node';
import {NeEdge} from '../models/ne-edge';
import {NeGroupedMappingsDiscrete} from '../models/ne-grouped-mappings-discrete';
import {NeMappingsMap} from '../models/ne-mappings-map';
import {NeContinuousThresholds} from '../models/ne-continuous-thresholds';
import {NeColorGradient} from '../models/ne-color-gradient';
import {NeContinuousMap} from '../models/ne-continuous-map';
import {NeThresholdMap} from '../models/ne-threshold-map';
import {NeContinuousChart} from '../models/ne-continuous-chart';

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
  networksDownloaded: NeNetwork[] = [];

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
   * Orders styles by their priority to avoid overriding high priority styles with newly added styles
   *
   * @param styles List of styles to be sorted
   */
  private static orderStylesByPriority(styles: NeStyle[]): NeStyle[] {
    return styles.sort((a, b) => (a.priority < b.priority) ? -1 : 1);
  }

  private static utilLeadingZeros(s: string, targetLength: number): string {
    while (s.length < targetLength) {
      s = '0'.concat(s);
    }
    return s;
  }

  /**
   * Fetches a network by its id
   * @param id The network's id
   */
  getNetworkById(id: number): NeNetwork {
    return this.networksParsed.find(x => x.id === id);
  }

  /**
   * Removes a discrete mapping completely
   * @param map The specified discrete mappping
   */
  removeDiscreteMapping(map: any): void {

    const network = this.getNetworkById(map.network);

    switch (map.type) {
      case 'nd':
        const ndSelectors = network.mappings.nodesDiscrete[map.mappingId].selectors;
        network.mappings.nodesDiscrete.splice(map.mappingId, 1);

        let ndNewStyle = [];
        for (const selector of ndSelectors) {

          ndNewStyle = ndNewStyle.concat(network.style.filter(x => x.selector !== selector));
          const className = selector.substring(1);

          for (const element of network.elements) {

            if (element.classes.includes(className)) {
              element.classes = element.classes.replace(className, '').trim();
            }
          }
        }

        network.style = ndNewStyle;
        network.aspectKeyValuesNodes[map.akvIndex].mapPointerD = network
          .aspectKeyValuesNodes[map.akvIndex]
          .mapPointerD
          .filter(x => x !== map.mappingId);
        break;
      case 'nc':

        // network.mappings.nodesContinuous.splice(map.mappingId, 1);
        //
        // for (const value of network.mappings.nodesContinuous[map.mappingId].values) {
        //   const correspondingStyle = network.style.find(x => x.selector === value.selector);
        //   delete correspondingStyle.style[value.cssKey];
        // }
        //
        // network.mappings.nodesContinuous.splice(map.mappingId, 1);
        // network.aspectKeyValuesNodes[map.akvIndex].mapPointerC = network
        //   .aspectKeyValuesNodes[map.akvIndex]
        //   .mapPointerC
        //   .filter(x => x !== map.mappingId);
        break;
      case 'ed':

        const edSelectors = network.mappings.edgesDiscrete[map.mappingId].selectors;
        network.mappings.edgesDiscrete.splice(map.mappingId, 1);

        let edNewStyle = [];
        for (const selector of edSelectors) {

          edNewStyle = edNewStyle.concat(network.style.filter(x => x.selector !== selector));
          const className = selector.substring(1);

          for (const element of network.elements) {

            if (element.classes.includes(className)) {
              element.classes = element.classes.replace(className, '').trim();
            }
          }
        }
        network.aspectKeyValuesEdges[map.akvIndex].mapPointerD = network
          .aspectKeyValuesEdges[map.akvIndex]
          .mapPointerD
          .filter(x => x !== map.mappingId);
        network.style = edNewStyle;
        break;
      case 'ec':

        // for (const value of network.mappings.edgesContinuous[map.mappingId].values) {
        //
        //   const correspondingStyle = network.style.find(x => x.selector === value.selector);
        //
        //   if (network.styleConstants['arrow-as-edge'] &&
        //     (value.cssKey === 'line-color' || value.cssKey === 'target-arrow-color' || value.cssKey === 'source-arrow-color')) {
        //     delete correspondingStyle.style['line-color'];
        //     delete correspondingStyle.style['target-arrow-color'];
        //     delete correspondingStyle.style['source-arrow-color'];
        //   } else {
        //     delete correspondingStyle.style[value.cssKey];
        //   }
        // }
        // network.aspectKeyValuesEdges[map.akvIndex].mapPointerC = network
        //   .aspectKeyValuesEdges[map.akvIndex]
        //   .mapPointerC
        //   .filter(x => x !== map.mappingId);
        // network.mappings.edgesContinuous.splice(map.mappingId, 1);
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
          if (attribute.key === map.col && attribute.value === map.is) {
            element.data.classes.push(map.selector.substring(1));
            element.classes = element.data.classes.join(' ');
            if (isNode && !styleMap.appliedTo.includes(element.data as NeNode)) {
              styleMap.appliedTo.push(element.data as NeNode);
              break;
            } else if (!styleMap.appliedTo.includes(element.data as NeEdge)) {
              styleMap.appliedTo.push(element.data as NeEdge);
              break;
            }
          }
        }
        if (!styles.includes(styleMap)) {
          styles.push(styleMap);
        }
      }
    }
    network.style = DataService.orderStylesByPriority(styles);
    network.elements = elements;

    const newlyGroupedMappings = this.updateMappings(discreteMapping, network.mappings);

    if (isNode) {
      network.mappings.nodesDiscrete = network.mappings.nodesDiscrete.concat(newlyGroupedMappings);

      for (const akv of network.aspectKeyValuesNodes) {
        if (akv.name === discreteMapping[0].colHR) {
          akv.mapPointerD.push(network.mappings.nodesDiscrete.length - 1);
        }
      }

    } else {
      network.mappings.edgesDiscrete = network.mappings.edgesDiscrete.concat(newlyGroupedMappings);

      for (const akv of network.aspectKeyValuesEdges) {
        if (akv.name === discreteMapping[0].colHR) {
          akv.mapPointerD.push(network.mappings.edgesDiscrete.length - 1);
        }
      }
    }

    this.networksParsed = this.networksParsed.filter(x => x.id !== id).concat(network);
  }

  private updateMappings(discreteMapping: NeMappingsDefinition[], mappings: NeMappingsMap): NeGroupedMappingsDiscrete[] {

    const groupedMappings: NeGroupedMappingsDiscrete[] = [];

    if (!mappings) {
      return groupedMappings;
    }

    outer: for (const map of discreteMapping) {
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

    for (const map of discreteMapping) {
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

  addMappingContinuous(id: number, isNode: boolean, continuousMapping: NeContinuousThresholds): void {
    const network = this.getNetworkById(id);
    const elements = network.elements;
    let styles: NeStyle[] = network.style;

    let minPropertyValue: number = Number(continuousMapping.mappedProperty.values[0]);
    let maxPropertyValue: number = Number(continuousMapping.mappedProperty.values[0]);
    for (const val of continuousMapping.mappedProperty.values) {
      if (Number(val) < minPropertyValue) {
        minPropertyValue = Number(val);
      }
      if (Number(val) > maxPropertyValue) {
        maxPropertyValue = Number(val);
      }
    }

    if (this.colorProperties.includes(continuousMapping.cssKey)) {

      const colorGradient: NeColorGradient[] = [];

      const lowestColor = String(continuousMapping.defaultLower);
      const lowest: NeColorGradient = {
        numericThreshold: '-1',
        offset: '-1',
        color: lowestColor,
        title: [continuousMapping.cssKey, continuousMapping.mappedProperty.name]
      };

      colorGradient.push(lowest);

      const greatestColor = String(continuousMapping.defaultGreater);
      const greatest: NeColorGradient = {
        numericThreshold: '101',
        offset: '101',
        color: greatestColor,
        title: [continuousMapping.cssKey || '', continuousMapping.mappedProperty.name]
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
          if (akv.name === continuousMapping.mappedProperty.name) {
            akv.mapPointerC.push(network.mappings.nodesContinuous.length - 1);
          }
        }
      } else {
        network.mappings.edgesContinuous = network.mappings.edgesContinuous.concat([finalizedMapping]);
        for (const akv of network.aspectKeyValuesEdges) {
          if (akv.name === continuousMapping.mappedProperty.name) {
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
          if (akv.name === continuousMapping.mappedProperty.name) {
            akv.mapPointerC.push(network.mappings.nodesContinuous.length - 1);
          }
        }
      } else {
        network.mappings.edgesContinuous = network.mappings.edgesContinuous.concat([finalizedMapping]);
        for (const akv of network.aspectKeyValuesEdges) {
          if (akv.name === continuousMapping.mappedProperty.name) {
            akv.mapPointerC.push(network.mappings.edgesContinuous.length - 1);
          }
        }
      }
    }

    for (const element of elements) {
      if (isNode ? element.group === 'nodes' : element.group === 'edges') {
        for (const attribute of element.data.attributes) {
          if (attribute.keyHR === continuousMapping.mappedProperty.name) {
            const elementValue = Number(attribute.value);

            let index = 0;
            while (continuousMapping.breakpoints.length > index && continuousMapping.breakpoints[index].value < elementValue) {
              index++;
            }

            const selector = ((isNode) ? '.node_' : '.edge_') + element.data.id;
            const style = styles.find(x => x.selector === selector);
            const styleObj: NeStyle = {
              selector,
              style: {},
              appliedTo: [element.data as NeNode],
              priority: 2
            };

            if (!element.data.classes.includes(selector.substring(1))) {
              element.data.classes.push(selector.substring(1));
              element.classes = element.data.classes.join(' ');
            }

            if (continuousMapping.breakpoints[index] && continuousMapping.breakpoints[index].value === elementValue) {
              // case 1: element hits breakpoint threshold => apply threshold value
              styleObj.style[continuousMapping.cssKey] = continuousMapping.breakpoints[index].value;

            } else if (index === 0 && continuousMapping.breakpoints[index] && continuousMapping.breakpoints[index].value > elementValue) {
              // case 2: element is smaller than lowest threshold => apply relatively lower
              const inputMap: NeContinuousMap = {
                inputValue: String(elementValue),
                lowerThreshold: String(minPropertyValue),
                lower: continuousMapping.defaultLower,
                greaterThreshold: String(continuousMapping.breakpoints[index].value),
                greater: String(continuousMapping.breakpoints[index].propertyValue)
              };

              styleObj.style[continuousMapping.cssKey] = this.calculateRelativeValue(inputMap);

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

              styleObj.style[continuousMapping.cssKey] = this.calculateRelativeValue(inputMap);

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

              styleObj.style[continuousMapping.cssKey] = this.calculateRelativeValue(inputMap);

            } else if (index === 0 && index === continuousMapping.breakpoints.length) {
              const inputMap: NeContinuousMap = {
                inputValue: String(elementValue),
                lowerThreshold: String(minPropertyValue),
                lower: String(continuousMapping.defaultLower),
                greaterThreshold: String(maxPropertyValue),
                greater: String(continuousMapping.defaultGreater)
              };

              styleObj.style[continuousMapping.cssKey] = this.calculateRelativeValue(inputMap);
            }

            if (!style) {
              styles.push(styleObj);
            } else {
              styles = styles.filter(x => x !== style).concat(this.addPropertyToStyle(style, styleObj));
            }
          }
        }
      }
    }
    network.elements = elements;
    network.style = DataService.orderStylesByPriority(styles);
    console.log(network);
    this.networksParsed = this.networksParsed.filter(x => x.id !== id).concat(network);
  }

  private addPropertyToStyle(existingStyle: NeStyle, styleObj: NeStyle): NeStyle {
    const keys = Object.keys(styleObj.style);
    for (const k of keys) {
      existingStyle.style[k] = styleObj.style[k];
    }
    return existingStyle;
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

      const resultR = DataService.utilLeadingZeros(resultMap.r.toString(16), 2);
      const resultG = DataService.utilLeadingZeros(resultMap.g.toString(16), 2);
      const resultB = DataService.utilLeadingZeros(resultMap.b.toString(16), 2);

      returnValue = '#'.concat(resultR.concat(resultG.concat(resultB)));

    } else {

      const yDiff = Number(inputMap.greater) - Number(inputMap.lower);
      const slopeCoefficient = yDiff / xDiff;

      returnValue = String(((xDiffRequired * slopeCoefficient) + Number(inputMap.lower)).toPrecision(5));
    }

    return returnValue;
  }

}
