import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {DataService} from '../../services/data.service';
import {ActivatedRoute} from '@angular/router';
import {NeNetwork} from '../../models/ne-network';
import {Subscription} from 'rxjs';
import {GraphService} from '../../services/graph.service';
import {faPalette, faLightbulb} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar-edit',
  templateUrl: './sidebar-edit.component.html',
  styleUrls: ['./sidebar-edit.component.scss']
})

/**
 * Component responsible for graph editing functionality
 */
export class SidebarEditComponent implements AfterViewInit, OnDestroy {

  faPalette = faPalette;
  faLightbulb = faLightbulb;

  selectedNetwork: NeNetwork;
  isInitialized = false;

  highlightNodes = '#0000ff';
  highlightEdges = '#0000ff';
  highlightDuration = 2000;

  showLabels = false;

  private readonly subscription: Subscription;

  constructor(public dataService: DataService,
              private route: ActivatedRoute,
              public graphService: GraphService) {
    this.subscription = this.route.paramMap.subscribe(params => {
      this.selectedNetwork = this.dataService.networksParsed.find(x => x.id === Number(params.get('id')));
    });
  }

  ngAfterViewInit(): void {
    this.isInitialized = true;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  toggleLabels(show: boolean): void {
    this.graphService.toggleLabels(show);
    this.showLabels = show;
  }


}
