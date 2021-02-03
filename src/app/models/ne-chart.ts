import {ChartDataSets} from 'chart.js';
import {Label} from 'ng2-charts';
import {NeChartType} from './ne-chart-type';

/**
 * Represents chart data for continuous mappings which are not color mappings
 */
export interface NeChart {

  /**
   * Specifies the type of chart
   */
  chartType: NeChartType;

  /**
   * Values on y-axis
   */
  chartData?: ChartDataSets[];

  /**
   * Values on x-axis
   */
  chartLabels?: Label[];

  /**
   * Options for the chart
   */
  lineChartOptions?: any;

  /**
   * Optionally color specifics for displaying
   */
  chartColors?: any;

}
