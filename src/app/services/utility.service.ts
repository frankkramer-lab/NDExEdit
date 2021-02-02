import {Injectable} from '@angular/core';
import {NeStyle} from '../models/ne-style';
import {HttpClient} from '@angular/common/http';
import {NeMappingsType} from '../models/ne-mappings-type';
import {NeAspect} from "../models/ne-aspect";

@Injectable({
  providedIn: 'root'
})

/**
 * Service for methods used within multiple components or services
 */
export class UtilityService {

  /**
   * Reading lookup file data
   *
   * @param http
   */
  constructor(private http: HttpClient) {
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
          ed: false,
          ec: false
        };
      case 'nc':
        return {
          nd: false,
          nc: true,
          ed: false,
          ec: false
        };
      case 'ed':
        return {
          nd: false,
          nc: false,
          ed: true,
          ec: false
        };
      case 'ec':
        return {
          nd: false,
          nc: false,
          ed: false,
          ec: true
        };
      default:
        return {
          nd: false,
          nc: false,
          ed: false,
          ec: false
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
   * @param mappings List of all available attributes
   */
  utilFilterForDiscrete(mappings: NeAspect[]): NeAspect[] {
    return mappings.filter(a => !a.datatype || a.datatype === 'integer' || a.datatype === 'string' || a.datatype === null);
  }

  /**
   * Returns a list of aspects suitable for continuous mappings
   * @param mappings List of all available attributes
   */
  utilFilterForContinuous(mappings: NeAspect[]): NeAspect[] {
    return mappings.filter(a => a.datatype && (a.datatype === 'integer' || a.datatype === 'float' || a.datatype === 'double'));

  }

}
