import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NeNetwork} from '../../models/ne-network';
import {DataService} from '../../services/data.service';
import {faPaintBrush, faExchangeAlt} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-main-stats',
  templateUrl: './main-stats.component.html',
  styleUrls: ['./main-stats.component.scss']
})

/**
 * Component responsible for graph statistics and description
 */
export class MainStatsComponent {
  selectedNetwork: NeNetwork;
  faPaintBrush = faPaintBrush;
  faExchangeAlt = faExchangeAlt;

  constructor(public route: ActivatedRoute, public dataService: DataService) {
    this.route.paramMap.subscribe(params => {
      this.selectedNetwork = this.dataService.networksParsed.find(x => x.id === Number(params.get('id')));
    });
  }
}
