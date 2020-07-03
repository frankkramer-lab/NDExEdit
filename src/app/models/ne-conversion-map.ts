import {NeConversionDetails} from './ne-conversion-details';

export interface NeConversionMap {
  ndex: string[];
  cytoscape: string[];
  selector?: string;
  conversionType?: string;
  conversion?: any[];
  splitRules?: NeConversionDetails;
  matchRules?: any;
  rules?: any;
}
