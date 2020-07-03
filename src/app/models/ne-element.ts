import {NeElementAttribute} from './ne-element-attribute';

export interface NeElement {
  id: string;
  name?: string;
  reference?: string;
  group: string;
  attributes?: NeElementAttribute[];
  classes?: string[];
}
