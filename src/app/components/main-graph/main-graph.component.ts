import {AfterViewInit, Component, ElementRef, OnDestroy, Renderer2, ViewChild} from '@angular/core';
import {DataService} from '../../services/data.service';
import {GraphService} from '../../services/graph.service';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-main-graph',
  templateUrl: './main-graph.component.html',
  styleUrls: ['./../../app.component.scss', './main-graph.component.scss']
})

/**
 * Component responsible for graph rendering and manipulation
 */
export class MainGraphComponent implements AfterViewInit, OnDestroy {

  /**
   * Contains DOM element for {@link https://js.cytoscape.org/|Cytoscape.js}
   */
  @ViewChild('cy') cyContainer: ElementRef;
  /**
   * Main view width which needs to be specified in order to re-render the graph accordingly
   */
  width: string;
  /**
   * Ensures that only a graph is rendered if the id is specified within the URL
   * @private
   */
  private readonly subscription: Subscription;
  /**
   * Checks if the view is initialized
   * @private
   */
  private isInitialized = false;

  /**
   * Subscribes to graph id and renders the graph if the view is already initialized
   *
   * @param dataService Service to read and write to globally accessible data
   * @param route Service to read URL
   * @param renderer necessary to access the DOM element and render the graph
   * @param graphService Servive to access graph manipulations
   */
  constructor(
    public dataService: DataService,
    public route: ActivatedRoute,
    private renderer: Renderer2,
    public graphService: GraphService
  ) {

    this.subscription = this.route.paramMap.subscribe(params => {
      const networkId = params.get('id');
      if (networkId) {
        dataService.selectNetwork(Number(networkId));
      }

      if (this.isInitialized) {
        this.renderGraph();
      }
    });

  }

  /**
   * Sets initialized status and renders graph
   */
  ngAfterViewInit(): void {
    this.isInitialized = true;
    this.dataService.setCanvas(this.cyContainer.nativeElement);
    this.renderGraph();
  }

  /**
   * Unsubscribes subscription to graph id
   */
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Fetches and sets the defined DOM element which is to contain the rendered graph;
   * also hands this container to the {@link GraphService} to {@link GraphService#render} the graph.
   * See {@link https://js.cytoscape.org/#core|Cytoscape.js (Core)} for further infos
   *
   * @private
   */
  private renderGraph(): void {

    this.graphService.render(this.dataService.getSelectedNetwork())
      .then(network => {})
      .catch(e => console.error(e));
  }

}
