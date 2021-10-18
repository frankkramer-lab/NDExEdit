import {Injectable} from '@angular/core';
import {NeAspect} from '../models/ne-aspect';
import {NeChart} from '../models/ne-chart';
import {NeStyle} from '../models/ne-style';
import {Core} from 'cytoscape';
import {NeMappingContinuous} from '../models/ne-mapping-continuous';
import {NeMappingDiscrete} from '../models/ne-mapping-discrete';
import {NeMapping} from '../models/ne-mapping';
import {NeBin} from '../models/ne-bin';

export enum ElementType {
  node,
  edge
}

export enum MappingType {
  continuous,
  discrete,
  passthrough
}

export enum AttributeType {
  color,
  numeric,
  fontFace,
  default
}

export enum InspectionRuleType {
  numeric,
  boolean,
  text
}


/**
 * Service for methods used within multiple components or services
 */
@Injectable({
  providedIn: 'root'
})
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

  /**
   * Types of elements
   */
  elementType = ElementType;

  /**
   * Types of mappings
   */
  mappingType = MappingType;
  /**
   * Types of attributes
   */
  attributeType = AttributeType;
  /**
   * Type of comparator for inspection rules
   */
  inspectionRuleType = InspectionRuleType;
  /**
   * List of valid numeric properties, as defined here {@link https://home.ndexbio.org/data-model/#data_types}
   */
  readonly numericTypes = [
    'long',
    'integer',
    'double'
  ];

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
    } else if (selector.startsWith('#') || selector.startsWith('node[id = ') || selector.startsWith('edge[id = ')) {
      // selectors: element specific
      priority = 2;
    } else if (selector.startsWith('node[') || selector.startsWith('edge[')) {
      // selectors: aspect specific
      priority = 1;
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
   * Display labels, if there are less than 300 nodes within the network
   * To avoid discrepancies in the code, this is the method to use,
   * instead of random hacks anywhere else.
   * @param core network
   */
  utilShowLabels(core: Core): boolean {
    return core.nodes().length < 500;
  }

  /**
   * Returns a list of aspects suitable for discrete mappings
   * @param aspects List of all available attributes
   */
  utilFilterForDiscrete(aspects: NeAspect[]): NeAspect[] {
    return aspects.filter(a => !a.datatype || a.datatype === 'integer' || a.datatype === 'boolean'
      || a.datatype === 'string' || a.datatype === null);
  }

  /**
   * Returns a list of aspects suitable for continuous mappings
   * @param aspects List of all available attributes
   * @param strict If true, do not treat integer as numeric property, should only be handled as discrete attribute
   */
  utilFilterForContinuous(aspects: NeAspect[], strict: boolean = false): NeAspect[] {
    if (strict) {
      return aspects.filter(a => a.datatype && (a.datatype === 'long' || a.datatype === 'double'));
    }
    return aspects.filter(a => a.datatype && (a.datatype === 'integer'
      || a.datatype === 'long' || a.datatype === 'double'));
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
   * @param numberOfBins number of bins calculated by Sturge's Rule
   * @param propertyToMap Aspect which is displayed in this histogram
   * @private
   */
  utilCalculateHistogramDataForBinSize(numberOfBins: number, propertyToMap: NeAspect): NeChart {
    const chartData = [];
    const chartLabels = [];
    const bins: NeBin[] = [];
    const binSteps = (propertyToMap.max - propertyToMap.min) / numberOfBins;

    let pointer: number = propertyToMap.min;

    for (let i = 0; i < numberOfBins; i++) {
      const bin: NeBin = {
        from: pointer,
        fromNormed: pointer.toExponential(2),
        to: pointer + binSteps,
        toNormed: (pointer + binSteps).toExponential(2),
        values: []
      };
      pointer += binSteps;
      bins.push(bin);
    }

    outer: for (const value of propertyToMap.numericValues) {
      for (const bin of bins) {
        if (value >= bin.from && value <= bin.to) {
          bin.values.push(value);
          continue outer;
        }
      }
    }

    for (const bin of bins) {
      chartLabels.push('[' + bin.fromNormed + ' : ' + bin.toNormed + ']');
    }

    chartData.push({
      data: bins.map(a => a.values.length),
      label: propertyToMap.name
    });

    const finalChart: NeChart = {
      chartData,
      chartLabels,
      chartType: {
        line: false,
        bar: true
      }
    };

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
            labelString: this.yAxisLabel ? (this.yAxisLabel + ' ' + propertyToMap.name) : ''
          }
        }]
      },
      legend: {
        display: true
      },
      responsive: true,
      maintainAspectRatio: false
    };
    return finalChart;
  }

  /**
   * Returns true if this akv may be used as continuous property
   * @param akv Aspect whose datatype is to be evaluated
   */
  utilFitForContinuous(akv: NeAspect): boolean {
    return this.numericTypes.includes(akv.datatype);
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
   * Extracts the column by which this mapping is built.
   * @param mapping Unintuitive string, e.g. "COL=Bait_Boolean,T=integer,K=0=1,V=0=Dialog,,plain,,14"
   */
  utilExtractColByMappingString(mapping: string): string {
    const regex = new RegExp('COL=(.*?),');
    return mapping.match(regex)[1];
  }

  /**
   * Extracts the type of mapping
   * @param mappingType Name of this mapping within .cx file
   */
  utilExtractTypeByMapping(mappingType: string): MappingType {
    switch (mappingType) {
      case 'PASSTHROUGH':
        return MappingType.passthrough;
      case 'DISCRETE':
        return MappingType.discrete;
      case 'CONTINUOUS':
        return MappingType.continuous;
    }
  }

  /**
   * Returns true, if the typeof comparison returns true for this input
   * @param input element to be typechecked
   */
  utilIsNumber(input: any): boolean {
    return typeof input === 'number';
  }

  /**
   * Returns true, if the value is not falsy, 0 is not evaluated to be falsy.
   * @param input element to be evaluated
   */
  utilIsDefined(input: any): boolean {
    if (typeof input === 'string') {
      return input.length > 0;
    }
    return input !== null && input !== undefined;
  }

  /**
   * Returns a new mapping object with the same properties as the given continuous mapping
   * @param mapping continuous mapping to be copied
   * @param targetThresholds list of thresholds for which this mapping has to fit
   */
  utilDeepCopyMappingContinuous(mapping: NeMappingContinuous, targetThresholds: number[] = null): NeMappingContinuous {
    const mappingCopy: NeMappingContinuous = Object.assign({}, mapping);

    const duplicatesCopy = [];
    for (const dup of mapping.duplicates) {
      if (dup !== null) {
        duplicatesCopy.push(Object.assign([], dup));
      } else {
        duplicatesCopy.push(null);
      }
    }

    mappingCopy.newlyAdded = mapping.newlyAdded;
    mappingCopy.duplicates = Object.assign([], duplicatesCopy);
    mappingCopy.equals = Object.assign([], mapping.equals);
    mappingCopy.thresholds = Object.assign([], mapping.thresholds);
    mappingCopy.greaters = Object.assign([], mapping.greaters);
    mappingCopy.lowers = Object.assign([], mapping.lowers);
    mappingCopy.useValue = Object.assign([], mapping.useValue);
    mappingCopy.colorGradient = Object.assign([], mapping.colorGradient);

    if (targetThresholds !== null) {

      for (let i = 0; i < targetThresholds.length; i++) {
        if (targetThresholds[i] !== mappingCopy.thresholds[i]) {
          mappingCopy.thresholds.splice(i, 0, targetThresholds[i]);
          mappingCopy.duplicates.splice(i, 0, null);
          mappingCopy.equals.splice(i, 0, mappingCopy.isColor ? '#000000' : null);
          mappingCopy.lowers.splice(i, 0, mappingCopy.isColor ? '#000000' : null);
          mappingCopy.greaters.splice(i, 0, mappingCopy.isColor ? '#000000' : null);
          mappingCopy.useValue.splice(i, 0, false);
        }
      }
    }
    return mappingCopy;
  }

  /**
   * Returns a new mapping object with the same properties as the given discrete mapping
   * @param mapping discrete mapping to be copied
   */
  utilDeepCopyMappingDiscrete(mapping: NeMappingDiscrete): NeMappingDiscrete {
    return {
      col: mapping.col,
      styleProperty: mapping.styleProperty,
      mappingType: this.mappingType.discrete,
      type: mapping.type,
      keys: mapping.keys,
      values: mapping.values,
      useValue: mapping.useValue,
      mapObject: Object.assign([], mapping.mapObject),
      newlyAdded: mapping.newlyAdded
    };
  }

  /**
   * Returns a new mapping object with the same properties as the given passthrough mapping
   * @param mapping passthrough mapping to be copied
   */
  utilDeepCopyMappingPassthrough(mapping: NeMapping): NeMapping {
    return {
      col: mapping.col,
      styleProperty: mapping.styleProperty,
      mappingType: this.mappingType.passthrough,
      useValue: mapping.useValue,
      newlyAdded: mapping.newlyAdded
    };
  }

  /**
   * Takes a color in hexadecimal format, then calculates and returns a contrasting color, also in hex format
   * @param hexColor base color for which a contrasting color is being calculated, such as #FF00FF
   */
  utilGetContrastColorByHex(hexColor: string): string {

    const rgbColor = this.utilGetRgbByHex(hexColor);

    const max = parseInt('FF', 16);
    const numContrastR = (max - rgbColor.r);
    const numContrastG = (max - rgbColor.g);
    const numContrastB = (max - rgbColor.b);
    const contrastR = this.utilLeftPad(numContrastR.toString(16), 2, '0');
    const contrastG = this.utilLeftPad(numContrastG.toString(16), 2, '0');
    const contrastB = this.utilLeftPad(numContrastB.toString(16), 2, '0');

    return ('#' + contrastR + contrastG + contrastB);
  }

  /**
   * Pads a string with a character until the requested length is achieved
   * @param s input string to be left padded
   * @param length target length
   * @param filler character to be padded with
   */
  utilLeftPad(s: string, length: number, filler: string): string {
    if (filler.length > 1) {
      console.log('Padding string only possible by one char!');
      return s;
    }
    while (s.length < length) {
      s = filler + s;
    }
    return s;
  }

  /**
   * Returns true, if the given hex string is too dark to make a black label text readable,
   * e.g. #023858 is a very dark blue and needs a white label to be readable
   * @param hexColor color in hexadecimal notation, including #
   */
  utilNeedsWhiteLabelText(hexColor: string): boolean {
    const rgbColor = this.utilGetRgbByHex(hexColor);
    const greyscaleColor = rgbColor.r * 0.299 + rgbColor.g * 0.587 + rgbColor.b * 0.114;
    return greyscaleColor < 130;
  }

  /**
   * Converts a hexadecimal color representation to an object containing keys for each color, without alpha channel
   * @param hexColor color in hexadecimal notation, including #
   */
  utilGetRgbByHex(hexColor: string): any {
    const inputR = hexColor.substr(1, 2);
    const inputG = hexColor.substr(3, 2);
    const inputB = hexColor.substr(5, 2);
    return {
      r: parseInt(inputR, 16),
      g: parseInt(inputG, 16),
      b: parseInt(inputB, 16)
    };
  }


  /**
   * Returns true, if the mapping contains duplicates
   * @param mapping Continuous mapping which is checked for duplicates
   * @private
   */
  utilContainsDuplicates(mapping: NeMappingContinuous): boolean {
    return mapping.duplicates.some(a => !!a && a.length > 0);
  }

  /**
   * Recalculates the histogram with a new number of bins
   * @param $event new number of bins
   * @param aspect attribute for which the chart is to be recalculated
   */
  utilSetBinSize($event: number, aspect: NeAspect): NeChart {
    if (aspect.validForContinuous) {
      aspect.chartContinuousDistribution = this.utilCalculateHistogramDataForBinSize($event, aspect);
    }
    return aspect.chartContinuousDistribution;
  }
}
