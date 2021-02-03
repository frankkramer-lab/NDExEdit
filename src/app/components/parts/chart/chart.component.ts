import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DataService} from '../../../services/data.service';
import {NeChart} from '../../../models/ne-chart';
import {faMinus, faPlus, faUndo} from '@fortawesome/free-solid-svg-icons';
import {NeMappingDiscrete} from "../../../models/ne-mapping-discrete";
import {NeMappingContinuous} from "../../../models/ne-mapping-continuous";
import {UtilityService} from "../../../services/utility.service";

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

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
   * Mapping to display
   */
  mapping: NeMappingDiscrete | NeMappingContinuous;
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

  ngOnInit(): void {
    this.binSizeInitially = this.numberOfBins;
    if (this.chartObject) {
      this.chartObject.chartColors = this.utilityService.utilGetRandomColorForChart();
    }
    if (this.index) {
      this.mapping = this.dataService.findMappingById(this.index);
    }
  }

  /**
   * Triggers a colorful redraw of a chart
   */
  triggerRedraw(): void {
    this.chartObject.chartColors = this.utilityService.utilGetRandomColorForChart();
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
