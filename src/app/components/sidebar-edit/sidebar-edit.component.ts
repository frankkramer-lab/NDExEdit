import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {DataService} from '../../services/data.service';
import {ActivatedRoute} from '@angular/router';
import {NeNetwork} from '../../models/ne-network';
import {Subscription} from 'rxjs';
import {GraphService} from '../../services/graph.service';

@Component({
  selector: 'app-sidebar-edit',
  templateUrl: './sidebar-edit.component.html',
  styleUrls: ['./sidebar-edit.component.scss']
})

/**
 * Component responsible for graph editing functionality
 */
export class SidebarEditComponent implements AfterViewInit, OnDestroy {
  selectedNetwork: NeNetwork;
  isInitialized = false;
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

}
