import {NeContinuousChart} from './ne-continuous-chart';
import {NeStyleComponent} from './ne-style-component';
import {NeColorGradient} from './ne-color-gradient';

export interface NeContinuousCollection {
  chart: NeContinuousChart;
  values: NeStyleComponent[];
  displayChart: boolean;
  colorGradient?: NeColorGradient[];
}
