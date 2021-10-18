import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../services/data.service';
import {ElementType, UtilityService} from '../../services/utility.service';
import {NeAspect} from '../../models/ne-aspect';
import {LayoutService} from '../../services/layout.service';

@Component({
  selector: 'app-main-stats',
  templateUrl: './main-stats.component.html',
  styleUrls: ['./main-stats.component.scss']
})

/**
 * Component responsible for graph statistics and description
 */
export class MainStatsComponent implements OnDestroy {
  /**
   * Points to aspect within the list of available attributes for nodes
   */
  nodeChartIndex: number = null;
  /**
   * Points to aspect within the list of available attributes for edges
   */
  edgeChartIndex: number = null;
  /**
   * Contains the selected edge aspect whose distribution chart is to be displayed
   */
  edgeAkv: NeAspect = null;
  /**
   * Contains the selected node aspect whose distribution chart is to be displayed
   */
  nodeAkv: NeAspect = null;

  /**
   * Subscribes to graph id and renders the graph if the view is already initialized
   *
   * @param route Service to read URL
   * @param dataService Service to read and write globally accessible data
   * @param utilityService Service responsible for shared code
   * @param layoutService Service responsible for tooltip directions
   */
  constructor(
    public route: ActivatedRoute,
    public dataService: DataService,
    public utilityService: UtilityService,
    public layoutService: LayoutService
  ) {
  }

  ngOnDestroy(): void {
    this.nodeAkv = null;
    this.nodeChartIndex = null;
    this.edgeAkv = null;
    this.edgeChartIndex = null;
  }

  /**
   * Selects a distribution chart to be displayed
   * @param chartIndex index to the node's or edge's attribute
   * @param type to distinguish between node and edge
   */
  displayDistributionChart(chartIndex: number, type: ElementType): void {
    if (type === ElementType.node) {
      this.nodeChartIndex = chartIndex;
      this.nodeAkv = this.dataService.selectedNetwork.aspectKeyValuesNodes[chartIndex];
    } else {
      this.edgeChartIndex = chartIndex;
      this.edgeAkv = this.dataService.selectedNetwork.aspectKeyValuesEdges[chartIndex];
    }
  }
}
