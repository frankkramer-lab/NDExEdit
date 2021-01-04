import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../services/data.service';
import {faExchangeAlt, faPaintBrush} from '@fortawesome/free-solid-svg-icons';

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
   * Amount of nodes in the selected network
   */
  nodeCount = 0;

  /**
   * Amount of edges in the selected network
   */
  edgeCount = 0;

  /**
   * Amount of style classes in the selected network (not counting the three utility classes added by NDExEdit);
   * also not counting the three default classes needed for Cytoscape.js
   */
  styleCount = 0;

  /**
   * Subscribes to graph id and renders the graph if the view is already initialized
   *
   * @param route Service to read URL
   * @param dataService Service to read and write globally accessible data
   */
  constructor(public route: ActivatedRoute, public dataService: DataService) {
    this.route.paramMap.subscribe(params => {
      const networkId = params.get('id');
      if (networkId) {
        this.nodeCount = this.dataService.networkSelected.elements.filter(x => x.group === 'nodes').length;
        this.edgeCount = this.dataService.networkSelected.elements.filter(x => x.group === 'edges').length;
        this.styleCount = this.dataService.networkSelected.style.length - 6;
      }
    });
  }
}
