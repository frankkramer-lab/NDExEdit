import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DataService} from '../../../services/data.service';
import {NeChart} from '../../../models/ne-chart';
import {faMinus, faPlus, faUndo} from '@fortawesome/free-solid-svg-icons';
import {NeMappingDiscrete} from '../../../models/ne-mapping-discrete';
import {NeMappingContinuous} from '../../../models/ne-mapping-continuous';
import {UtilityService} from '../../../services/utility.service';
import {NeMapping} from '../../../models/ne-mapping';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, OnDestroy {

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
   * Mapping to display
   */
  mapping: NeMappingContinuous | NeMappingDiscrete | NeMapping;
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

  constructor(
    public dataService: DataService,
    private utilityService: UtilityService
  ) {
    dataService.chartRedrawEmitter.subscribe(value => this.triggerRedraw());
  }

  ngOnDestroy(): void {
    this.binSizeEmitter.emit(this.binSizeInitially);
    this.numberOfBins = null;
  }

  ngOnInit(): void {
    if (!this.binSizeInitially) {
      this.binSizeInitially = this.numberOfBins;
    }

    if (this.chartObject) {
      this.chartObject.chartColors = this.utilityService.utilGetRandomColorForChart();
    }
  }

  /**
   * Triggers a colorful redraw of a chart
   */
  triggerRedraw(): void {
    if (this.chartObject) {
      this.chartObject.chartColors = this.utilityService.utilGetRandomColorForChart();
    }
  }

  /**
   * Sets the number of bins for the distribution chart
   * only if the size is changing
   * @param newBinSize new number of bins
   * @param enforce when resetting the number of bins we need to enforce
   */
  setNumberOfBins(newBinSize: number, enforce: boolean = false): void {
    if (enforce || (this.numberOfBins !== newBinSize && newBinSize > 0)) {
      this.numberOfBins = newBinSize;
      this.binSizeEmitter.emit(this.numberOfBins);
    }
  }

}
