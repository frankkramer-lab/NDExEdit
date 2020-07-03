import {NeElement} from './ne-element';
import {NeElementAttribute} from './ne-element-attribute';
import {NePosition} from './ne-position';

export interface NeNode extends NeElement {
  id: string;
  group: string;
  name: string;
  reference?: string;
  attributes?: NeElementAttribute[];
  position?: NePosition;
  classes?: string[];
}
