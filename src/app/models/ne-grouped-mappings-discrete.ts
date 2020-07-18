import {NeStyleComponent} from './ne-style-component';
import {NeStyleMap} from './ne-style-map';

export interface NeGroupedMappingsDiscrete {
  classifier: string;
  values: string[];
  css: NeStyleMap[];
}
