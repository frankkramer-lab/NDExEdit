import {NeContinuousChart} from './ne-continuous-chart';
import {NeStyleComponent} from './ne-style-component';

export interface NeContinuousCollection {
  chart: NeContinuousChart[];
  values: NeStyleComponent[];
  displayChart: boolean;
}
