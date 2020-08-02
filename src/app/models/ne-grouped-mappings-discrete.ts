import {NeStyleMap} from './ne-style-map';

export interface NeGroupedMappingsDiscrete {
  classifier: string;
  values: string[];
  styleMap: NeStyleMap[];
  th: string[];
  selectors: string[];
}
