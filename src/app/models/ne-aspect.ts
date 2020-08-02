import {NeElement} from './ne-element';

export interface NeAspect {
  name: string;
  values: string[];
  appliedTo?: NeElement[];
  datatype?: string;
  mapPointerC?: number[];
  mapPointerD?: number[];
  chartDiscreteDistribution?: any;
  chartContinuousDistribution?: any;
}
