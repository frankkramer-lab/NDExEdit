import {Injectable} from '@angular/core';
import {NeMappingsType} from '../models/ne-mappings-type';
import {NeAspect} from '../models/ne-aspect';
import {NeChart} from '../models/ne-chart';
import {NeFrequencyCounter} from '../models/ne-frequency-counter';
import {NeStyle} from '../models/ne-style';

@Injectable({
  providedIn: 'root'
})

/**
 * Service for methods used within multiple components or services
 */
export class UtilityService {

  /**
   * Label for continuous x axis
   */
  xAxisContinuousLabel: string;

  /**
   * Label for discrete / passthrough x axis
   */
  xAxisDiscreteLabel: string;

  /**
   * Label for y axis
   */
  yAxisLabel: string;

  constructor() {
  }

  /**
   * Utility method for removing any whitespace and round brackets from a string; also casts to lower case
   *
   * @param input string to be cleaned
   * @returns cleaned string
   */
  public static utilCleanString(input: string): string {
    if (!input) {
      return '';
    }
    input = String(input);
    return input.replace(/\s*\(*\)*\.*\/*\\*/g, '').toLowerCase();
  }

  /**
   * Utility method for finding a selector's priority, essential for ordering styles
   *
   * @param selector name of the element's selector
   */
  public static utilFindPriorityBySelector(selector: string): number {
    let priority = -1;

    if (selector === 'node' || selector === 'edge') {
      // selectors: default
      priority = 0;
    } else if (selector.startsWith('.') && selector.match(/[0-9]/g) === null) {
      // selectors: aspect specific
      priority = 1;
    } else if (selector.match(/[0-9]/g) !== null) {
      // selectors: element specific
      priority = 2;
    } else if (selector.includes(':')) {
      // selectors: special
      priority = 3;
    }

    return priority;
  }

  /**
   * Orders styles by their priority to avoid overriding high priority styles with newly added styles
   *
   * @param styles list of styles to be sorted
   */
  public static utilOrderStylesByPriority(styles: NeStyle[]): NeStyle[] {
    return styles.sort((a, b) => (a.priority < b.priority) ? -1 : 1);
  }

  /**
   * Consolidating type hints for each kind of mapping by using a model.
   * In context of e.g. routing there is still a lot of string usage.
   * This method will hopefully ease the transition to model standardization.
   * @param s Can either be 'nd', 'nc', 'ed' or 'ec'
   */
  utilGetTypeHintByString(s: string): NeMappingsType {
    switch (s) {
      case 'nd':
        return {
          nd: true,
          nc: false,
          np: false,
          ed: false,
          ec: false,
          ep: false
        };
      case 'nc':
        return {
          nd: false,
          nc: true,
          np: false,
          ed: false,
          ec: false,
          ep: false
        };
      case 'ed':
        return {
          nd: false,
          nc: false,
          np: false,
          ed: true,
          ec: false,
          ep: false
        };
      case 'ec':
        return {
          nd: false,
          nc: false,
          np: false,
          ed: false,
          ec: true,
          ep: false
        };
      case 'np':
        return {
          nd: false,
          nc: false,
          np: true,
          ed: false,
          ec: false,
          ep: false
        };
      case 'ep':
        return {
          nd: false,
          nc: false,
          np: false,
          ed: false,
          ec: false,
          ep: true
        };
      default:
        return {
          nd: false,
          nc: false,
          np: false,
          ed: false,
          ec: false,
          ep: false
        };
    }
  }

  /**
   * Returns literal string representation for maptype
   * @param typeHint Map of hints applying to this mapping
   */
  utilGetTypeLiteralByTypeHint(typeHint: NeMappingsType): string {
    if (typeHint.nd) {
      return 'nd';
    } else if (typeHint.nc) {
      return 'nc';
    } else if (typeHint.ed) {
      return 'ed';
    } else if (typeHint.ec) {
      return 'ec';
    } else if (typeHint.np) {
      return 'np';
    } else if (typeHint.ep) {
      return 'ep';
    }
    return '';
  }

  /**
   * Display labels, if there are less than 300 nodes within the network
   * To avoid discrepancies in the code, this is the method to use,
   * instead of random hacks anywhere else.
   * @param core network
   */
  utilShowLabels(core: cytoscape.Core): boolean {
    return core.nodes().length < 300;
  }

  /**
   * Takes an input string and removes a prefix, if it matches one of the specified prefixes
   * @param input String to clear
   * @param strings List of prefixes
   */
  utilRemovePrefix(input: string, strings: string[]): string {
    for (const prefix of strings) {
      if (input.startsWith(prefix)) {
        return input.substr(prefix.length);
      }
    }
    return input;
  }

  /**
   * Returns a list of aspects suitable for discrete mappings
   * @param aspects List of all available attributes
   */
  utilFilterForDiscrete(aspects: NeAspect[]): NeAspect[] {
    return aspects.filter(a => !a.datatype || a.datatype === 'integer' || a.datatype === 'string' || a.datatype === null);
  }

  /**
   * Returns a list of aspects suitable for continuous mappings
   * @param aspects List of all available attributes
   * @param strict If true, do not treat integer as numeric property, should only be handled as discrete attribute
   */
  utilFilterForContinuous(aspects: NeAspect[], strict: boolean = false): NeAspect[] {
    if (strict) {
      return aspects.filter(a => a.datatype && (a.datatype === 'float' || a.datatype === 'double'));
    }
    return aspects.filter(a => a.datatype && (a.datatype === 'integer' || a.datatype === 'float' || a.datatype === 'double'));

  }

  /**
   * Returns a random color for a chart
   */
  utilGetRandomColorForChart(): any[] {

    const colorChoicesFill = [
      'rgba(255,0,0,0.3)',
      'rgba(0,255,0,0.3)',
      'rgba(0,0,255,0.3)',
      'rgba(255,255,0,0.3)',
      'rgba(255,0,255,0.3)',
      'rgba(0,255,255,0.3)'
    ];

    const colorChoicesBorder = [
      'red',
      'green',
      'blue',
      'yellow',
      'pink',
      'teal'
    ];
    const rdn = Math.floor(Math.random() * 100000) % colorChoicesFill.length;
    return [{
      hoverBackgroundColor: colorChoicesFill[rdn],
      backgroundColor: colorChoicesFill[rdn],
      borderColor: colorChoicesBorder[rdn],
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }];
  }


  /**
   * Returns the number of bins to be applied to the given set of numbers
   * {@link https://en.wikipedia.org/wiki/Histogram#Sturges'_formula|Sturge's Rule}
   * @param numbers list of numbers
   * @private
   */
  utilSturgesRule(numbers: number[]): number {
    return Math.ceil(1 + Math.log2(numbers.length));
  }


  /**
   * Calculates data for the continuous distribution chart as histogram
   * with default binSize calculated as Sturge's Rule
   *
   * @param binSize number of bins calculated by Sturge's Rule
   * @param propertyToMap Aspect which is displayed in this histogram
   * @param axisLabels list of strings containing axis labels, if needed, 0 => x, 1 => y
   * @private
   */
  utilCalculateHistogramDataForBinSize(binSize: number, propertyToMap: NeAspect, axisLabels: string[] = []): NeChart {
    const chartData = [];
    const frequencies: NeFrequencyCounter[] = [];
    const chartLabels = [];

    if (isNaN(binSize) || isNaN(propertyToMap.min) || isNaN(propertyToMap.max)) {
      console.log('Histogram data could not be calculated');
      return {
        chartData,
        chartLabels,
        chartType: {
          line: false,
          bar: true
        }
      };
    }
    const min = Number(propertyToMap.min);
    const max = Number(propertyToMap.max);
    const values = propertyToMap.values as unknown as number[];

    const sizeOfBin = Number(((max - min) / binSize).toFixed(4));

    let intervalPointer = min;
    while (intervalPointer < max) {

      const nextThreshold = Number((intervalPointer + sizeOfBin).toFixed(4));
      frequencies.push({
        lowerBorder: intervalPointer,
        upperBorder: nextThreshold,
        occurance: 0
      });

      chartLabels.push('[' + intervalPointer + ':' + nextThreshold + ']');
      intervalPointer = nextThreshold;
    }

    for (const f of frequencies) {
      for (const value of values) {

        if (value === min && frequencies.indexOf(f) === 0) {
          f.occurance++;
          continue;
        }

        if (value > f.lowerBorder && value <= f.upperBorder) {
          f.occurance++;
        }
      }
    }

    chartData.push({
      data: frequencies.map(a => a.occurance),
      label: propertyToMap.name
    });

    const finalChart: NeChart = {
      chartType: {
        bar: true,
        line: false
      },
      chartLabels,
      chartData
    };

    if (axisLabels.length > 0) {
      finalChart.chartOptions = {
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: this.xAxisContinuousLabel || ''
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: this.yAxisLabel ? (this.yAxisLabel + propertyToMap.name) : ''
            }
          }]
        }
      };
    }
    return finalChart;
  }

  /**
   * Returns true if this akv may be used as continuous property
   * @param akv Aspect whose datatype is to be evaluated
   */
  utilFitForContinuous(akv: NeAspect): boolean {
    return (akv.datatype === 'integer' || akv.datatype === 'double' || akv.datatype === 'float');
  }

  /**
   * Calculates sum of the list of numbers
   * @param numbers List of numbers to be reduced
   */
  utilSum(numbers: number[]): number {
    if (numbers.length > 0) {
      return numbers.reduce((acc, curr) => acc + curr);
    }
    return null;
  }

  /**
   * Extracts a singular discrete mapping from a collection of multiple discrete mappings to the same attribute
   * @param mapping grouped discrete mapping
   * @param index points to the index within this mapping's style map
   */
  // utilExtractDiscreteFromGroupedDiscrete(mapping: NeGroupedMappingsDiscrete, index: number): NeMappingDiscrete {
  //   // todo remove this when editing, because NeGroupedMappingsDiscrete is going to be unnecessary
  //   return {
  //     keys: [],
  //     col: mapping.col,
  //     styleProperty: mapping.styleMap[index].cssKey,
  //     type: mapping.datatype,
  //     values: mapping.styleMap[index].cssValues
  //   };
  //
  // }

  /**
   * Extracts the column by which this mapping is built.
   * @param mapping Unintuitive string, e.g. "COL=Bait_Boolean,T=integer,K=0=1,V=0=Dialog,,plain,,14"
   */
  utilExtractColByMappingString(mapping: string): string {
    const regex = new RegExp('COL=(.*?),');
    return mapping.match(regex)[1];
  }

}
