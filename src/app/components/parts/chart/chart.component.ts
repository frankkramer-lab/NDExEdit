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

  @Input() lookup?: string;

  @Input() attribute?: string;

  @Input() index?: string;

  @Input() widthPercent: number;

  @Input() chartObject!: NeChart;

  @Input() precision?: number;

  @Input() numberOfBins?: number;

  @Output() binSizeEmitter = new EventEmitter<number>();

  binSizeInitially: number;

  faPlus = faPlus;

  faMinus = faMinus;

  faUndo = faUndo;

  colorChoicesFill = [
    'rgba(255,0,0,0.3)',
    'rgba(0,255,0,0.3)',
    'rgba(0,0,255,0.3)',
    'rgba(255,255,0,0.3)',
    'rgba(255,0,255,0.3)',
    'rgba(0,255,255,0.3)'
  ];

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
  }

  /**
   * Triggers a colorful redraw of a chart
   */
  triggerRedraw(): void {
    const rdn = Math.floor(Math.random() * 100000) % this.colorChoicesFill.length;
    this.chartObject.lineChartColors = [{
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
    if (this.numberOfBins !== newBinSize) {
      this.numberOfBins = newBinSize;
    }
    this.binSizeEmitter.emit(this.numberOfBins);
  }
}
