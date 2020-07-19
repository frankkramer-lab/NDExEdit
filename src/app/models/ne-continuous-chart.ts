import {ChartDataSets} from 'chart.js';
import {Color, Label} from 'ng2-charts';

export interface NeContinuousChart {
  lineChartData: ChartDataSets[];
  lineChartLabels: Label[];
  lineChartColors: Color[];
  lineChartOptions: any;
}
