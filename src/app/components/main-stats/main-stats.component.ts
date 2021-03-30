import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../services/data.service';
import {faExchangeAlt, faPaintBrush, faHome} from '@fortawesome/free-solid-svg-icons';
import {UtilityService} from '../../services/utility.service';
import {NeAspect} from '../../models/ne-aspect';

@Component({
  selector: 'app-main-stats',
  templateUrl: './main-stats.component.html',
  styleUrls: ['./main-stats.component.scss']
})

/**
 * Component responsible for graph statistics and description
 */
export class MainStatsComponent {
  /**
   * Icon: faHome
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faHome = faHome;
  /**
   * Icon: faPaintBrush
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faPaintBrush = faPaintBrush;

  /**
   * Icon: faExchangeAlt
   * See {@link https://fontawesome.com/icons?d=gallery|Fontawesome} for further infos
   */
  faExchangeAlt = faExchangeAlt;

  /**
   * Subscribes to graph id and renders the graph if the view is already initialized
   *
   * @param route Service to read URL
   * @param dataService Service to read and write globally accessible data
   * @param utilityService Service reponsible for shared code
   */
  constructor(
    public route: ActivatedRoute,
    public dataService: DataService,
    private utilityService: UtilityService
  ) {
    this.route.paramMap.subscribe(params => {
      const networkId = params.get('id');
      if (networkId) {
        this.dataService.selectNetwork(Number(networkId));
      }
    });

  }

  /**
   * Recalculates the histogram with a new number of bins
   * @param $event new number of bins
   * @param aspect attribute for which the chart is to be recalculated
   */
  setBinSize($event: number, aspect: NeAspect): void {
    aspect.chartContinuousDistribution = this.utilityService.utilCalculateHistogramDataForBinSize($event, aspect);
  }
}
