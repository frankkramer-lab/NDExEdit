import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DataService} from '../../../services/data.service';
import {NeChart} from '../../../models/ne-chart';
import {faMinus, faPlus, faUndo} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  /**
   * Name of the lookup which is part of the mapping
   */
  // @Input() lookup?: string;

  /**
   * Name of the attribute which is part of the mapping
   */
  // @Input() attribute?: string;

  /**
   * Sidebar chart displaying a preview for the continuous mapping needs a router link
   * to the corresponding mapping, to display details.
   * Index points to the corresponding mapping
   */
  @Input() index?: string;

  /**
   * Since height is automatically set, width can be set by parent component
   */
  @Input() widthPercent?: number;

  /**
   * Chart object which is to be rendered
   */
  @Input() chartObject!: NeChart;

  /**
   * Currently set number of bins
   */
  @Input() numberOfBins?: number;

  /**
   * Triggers redraw of the chart with the new binSize to better evaluate your data
   * for continuous mappings
   */
  @Output() binSizeEmitter = new EventEmitter<number>();

  /**
   * Default binSize for this property
   */
  binSizeInitially: number;
  /**
   * Icon: faPlus
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPlus = faPlus;
  /**
   * Icon: faMinus
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faMinus = faMinus;
  /**
   * Icon: faUndo
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faUndo = faUndo;

  /**
   * Possible fills for the continuous charts, which are not color-associated mappings
   */
  colorChoicesFill = [
    'rgba(255,0,0,0.3)',
    'rgba(0,255,0,0.3)',
    'rgba(0,0,255,0.3)',
    'rgba(255,255,0,0.3)',
    'rgba(255,0,255,0.3)',
    'rgba(0,255,255,0.3)'
  ];

  /**
   * Matching borders for the continuous charts, which are not color-associated mappings
   */
  colorChoicesBorder = [
    'red',
    'green',
    'blue',
    'yellow',
    'pink',
    'teal'
  ];

  constructor(public dataService: DataService) {
    dataService.chartRedrawEmitter.subscribe(value => this.triggerRedraw());
  }

  ngOnInit(): void {
    this.binSizeInitially = this.numberOfBins;
    this.chartObject.lineChartColors = this.getRandomColorForChart();
  }

  /**
   * Triggers a colorful redraw of a chart
   */
  triggerRedraw(): void {
    this.chartObject.lineChartColors = this.getRandomColorForChart();
  }

  /**
   * Returns a random color for a chart
   */
  getRandomColorForChart(): any[] {
    const rdn = Math.floor(Math.random() * 100000) % this.colorChoicesFill.length;
    return [{
      hoverBackgroundColor: this.colorChoicesFill[rdn],
      backgroundColor: this.colorChoicesFill[rdn],
      borderColor: this.colorChoicesBorder[rdn],
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }];
  }

  /**
   * Sets the number of bins for the distribution chart
   * only if the size is changing
   * @param newBinSize new number of bins
   */
  setNumberOfBins(newBinSize: number): void {
    if (this.numberOfBins !== newBinSize && newBinSize > 0) {
      this.numberOfBins = newBinSize;
      this.binSizeEmitter.emit(this.numberOfBins);
    }
  }
}
