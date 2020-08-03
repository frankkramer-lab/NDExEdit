import {ChartDataSets} from 'chart.js';
import {Label} from 'ng2-charts';

export interface NeContinuousChart {
  lineChartData: ChartDataSets[];
  lineChartLabels: Label[];
  lineChartOptions: any;
}
