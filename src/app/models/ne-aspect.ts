import {NeElement} from './ne-element';
import {NeElementAttribute} from './ne-element-attribute';

export interface NeAspect {
  name: string;
  values: string[];
  appliedTo?: NeElement[];
}
