import {Injectable} from '@angular/core';
import {NeStyle} from '../models/ne-style';
import {NeStyleComponent} from '../models/ne-style-component';
import {NeContinuousMap} from '../models/ne-continuous-map';

@Injectable({
  providedIn: 'root'
})

/**
 * Service for methods used within multiple components or services
 */
export class UtilityService {

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
    return input.replace(/\s*\(*\)*\.*/g, '').toLowerCase();
  }

  /**
   * Utility method for finding a selector's priority, essential for ordering styles
   *
   * @param selector name of the element's selector
   */
  public static utilfindPriorityBySelector(selector: string): number {
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
   * Orders styleComponents by their priority to avoid overriding high priority styles with newly added styles
   *
   * @param styles list of styles to be sorted
   */
  public static utilOrderStyleComponentsByPriority(styles: NeStyleComponent[]): NeStyleComponent[] {
    return styles.sort((a, b) => (a.priority < b.priority) ? -1 : 1);
  }


  /**
   * Fills a string with leading zeros to the specified length
   *
   * @param s string to be filled
   * @param targetLength final number of characters
   * @private
   */
  public static utilLeadingZeros(s: string, targetLength: number): string {
    while (s.length < targetLength) {
      s = '0'.concat(s);
    }
    return s;
  }

  /**
   * Calculates relative values for continuous mappings
   *
   * @param inputMap contains the value to be mapped and the upper and lower thresholds
   */
  public static utilCalculateRelativeValue(inputMap: NeContinuousMap): string {

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

      const resultR = UtilityService.utilLeadingZeros(resultMap.r.toString(16), 2);
      const resultG = UtilityService.utilLeadingZeros(resultMap.g.toString(16), 2);
      const resultB = UtilityService.utilLeadingZeros(resultMap.b.toString(16), 2);

      returnValue = '#'.concat(resultR.concat(resultG.concat(resultB)));

    } else {

      const yDiff = Number(inputMap.greater) - Number(inputMap.lower);
      const slopeCoefficient = yDiff / xDiff;

      returnValue = String(((xDiffRequired * slopeCoefficient) + Number(inputMap.lower)).toPrecision(5));
    }

    return returnValue;
  }

}
