import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../services/data.service';
import {NeNetwork} from '../../models/ne-network';

@Component({
  selector: 'app-main-mappings',
  templateUrl: './main-mappings.component.html',
  styleUrls: ['./main-mappings.component.scss']
})
export class MainMappingsComponent implements OnInit {

  selectedNetwork: NeNetwork;
  selectedMapping: any;

  constructor(private route: ActivatedRoute, public dataService: DataService) {
    this.route.paramMap.subscribe(params => {
      this.selectedNetwork = this.dataService.networksParsed.find(x => x.id === Number(params.get('id')));
      const mapIndex = params.get('map').substring(2);
      switch (params.get('map').substring(0, 2)) {
        case 'ec':
          this.selectedMapping = this.selectedNetwork.mappings.edgesContinuous[mapIndex];
          break;
        case 'nc':
          this.selectedMapping = this.selectedNetwork.mappings.nodesContinuous[mapIndex];
          break;
        default:
          break;
      }
    });
  }

  ngOnInit(): void {
  }

}
