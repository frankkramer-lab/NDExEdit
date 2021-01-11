import {Component, DoCheck, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {DataService} from '../../../services/data.service';
import {NeChartType} from '../../../models/ne-chart-type';
import {NeChart} from '../../../models/ne-chart';

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

  @Input() chartType: NeChartType;

  @Input() chartObject!: NeChart; // or other types

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
  }

  /**
   * Triggers a colorful redraw of the line chart
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
}
