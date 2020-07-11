import {NeElement} from './ne-element';
import {NeNode} from './ne-node';
import {NeElementAttribute} from './ne-element-attribute';

export interface NeEdge extends NeElement {
  id: string;
  group: string;
  name: string;
  source: string;
  target: string;
  attributes?: NeElementAttribute[];
  classes?: string[];
}
