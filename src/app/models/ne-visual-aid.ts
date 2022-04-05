import {NeChart} from './ne-chart';
import {NeColorGradient} from './ne-color-gradient';

export interface NeVisualAid {
  isValid: boolean;
  isHistogram: boolean;
  chartObj: NeChart;
  gradientObj: NeColorGradient[];

}
