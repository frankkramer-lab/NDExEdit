import {ChartDataSets} from 'chart.js';
import {Label} from 'ng2-charts';

/**
 * Represents chart data for continuous mappings which are not color mappings
 */
export interface NeContinuousChart {

  /**
   * Values on y-axis
   */
  lineChartData: ChartDataSets[];

  /**
   * Values on x-axis
   */
  lineChartLabels: Label[];

  /**
   * Options for the chart
   */
  lineChartOptions: any;
}
