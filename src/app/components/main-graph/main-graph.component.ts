import {AfterViewInit, Component, OnDestroy, Renderer2} from '@angular/core';
import {NeNetwork} from '../../models/ne-network';
import {DataService} from '../../services/data.service';
import {GraphService} from '../../services/graph.service';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-main-graph',
  templateUrl: './main-graph.component.html',
  styleUrls: ['./main-graph.component.scss']
})
export class MainGraphComponent implements AfterViewInit, OnDestroy {
  selectedNetwork: NeNetwork;
  cyContainer: any;
  private readonly subscription: Subscription;
  private isInitialized = false;

  constructor(
    public dataService: DataService,
    public route: ActivatedRoute,
    private renderer: Renderer2,
    public graphService: GraphService) {

    this.subscription = this.route.paramMap.subscribe(params => {
      this.selectedNetwork = this.dataService.networksParsed.find(x => x.id === Number(params.get('id')));

      if (this.isInitialized) {
        this.renderGraph();
      }
    });

  }

  ngAfterViewInit(): void {
    this.isInitialized = true;
    this.renderGraph();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private renderGraph(): void {
    this.cyContainer = this.renderer.selectRootElement('#cy');
    this.graphService.render(this.cyContainer, this.selectedNetwork);
  }
}
